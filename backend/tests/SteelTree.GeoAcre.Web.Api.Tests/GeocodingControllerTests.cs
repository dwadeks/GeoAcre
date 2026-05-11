using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using SteelTree.GeoAcre.Web.Api.Models;
using SteelTree.GeoAcre.Web.Api.Services;

namespace SteelTree.GeoAcre.Web.Api.Tests;

[TestClass]
public class GeocodingControllerTests
{
    [TestMethod]
    public async Task Search_WithValidQuery_ReturnsResults()
    {
        await using var factory = CreateFactory(new StubGeocodeService
        {
            SearchResults =
            [
                new GeocodeResult
                {
                    Id = "1",
                    DisplayName = "Springfield, IL",
                    Latitude = 39.7817,
                    Longitude = -89.6501,
                }
            ]
        });

        var client = factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/geocoding/search", new GeocodeSearchRequest
        {
            Query = "Springfield, IL",
            MaxResults = 5,
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var payload = await response.Content.ReadFromJsonAsync<GeocodeSearchResponse>();
        payload.Should().NotBeNull();
        payload!.Results.Should().HaveCount(1);
    }

    [TestMethod]
    public async Task Reverse_WithValidCoordinates_ReturnsAddress()
    {
        await using var factory = CreateFactory(new StubGeocodeService
        {
            ReverseAddress = "Springfield, IL, USA"
        });

        var client = factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/geocoding/reverse", new ReverseGeocodeRequest
        {
            Latitude = 39.7817,
            Longitude = -89.6501,
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var payload = await response.Content.ReadFromJsonAsync<ReverseGeocodeResponse>();
        payload.Should().NotBeNull();
        payload!.Address.Should().Be("Springfield, IL, USA");
    }

    [TestMethod]
    public async Task Search_WithEmptyQuery_ReturnsBadRequest()
    {
        await using var factory = CreateFactory(new StubGeocodeService());
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/geocoding/search", new GeocodeSearchRequest
        {
            Query = "",
            MaxResults = 5,
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [TestMethod]
    public async Task Search_WhenProviderFails_ReturnsServiceUnavailable()
    {
        await using var factory = CreateFactory(new StubGeocodeService
        {
            ThrowOnSearch = new HttpRequestException("Nominatim unavailable")
        });
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/geocoding/search", new GeocodeSearchRequest
        {
            Query = "Springfield",
            MaxResults = 5,
        });

        response.StatusCode.Should().Be(HttpStatusCode.ServiceUnavailable);
    }

    private static WebApplicationFactory<Program> CreateFactory(IGeocodeService geocodeService)
    {
        return new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.AddSingleton(geocodeService);
                });
            });
    }

    private sealed class StubGeocodeService : IGeocodeService
    {
        public IEnumerable<GeocodeResult> SearchResults { get; set; } = [];
        public string ReverseAddress { get; set; } = "Unknown";
        public Exception? ThrowOnSearch { get; set; }

        public Task<IEnumerable<GeocodeResult>> SearchAsync(string query, int maxResults = 10)
        {
            if (ThrowOnSearch is not null)
            {
                throw ThrowOnSearch;
            }

            return Task.FromResult(SearchResults);
        }

        public Task<string> ReverseGeocodeAsync(double latitude, double longitude)
        {
            return Task.FromResult(ReverseAddress);
        }
    }
}