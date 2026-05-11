using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using SteelTree.GeoAcre.Geometry;
using SteelTree.GeoAcre.Web.Api.Models;

namespace SteelTree.GeoAcre.Web.Api.Tests;

[TestClass]
public class SelfIntersectionTests
{
    [TestMethod]
    public async Task CalculateArea_WithSelfIntersectingPolygon_ReturnsIntersectionWarningFlag()
    {
        await using var factory = new WebApplicationFactory<Program>();
        var client = factory.CreateClient();

        var request = new CalculateAreaRequest
        {
            Vertices =
            [
                new LatLngDto { Latitude = 39.0000, Longitude = -89.0000 },
                new LatLngDto { Latitude = 39.0100, Longitude = -88.9900 },
                new LatLngDto { Latitude = 39.0000, Longitude = -88.9900 },
                new LatLngDto { Latitude = 39.0100, Longitude = -89.0000 },
            ],
        };

        var response = await client.PostAsJsonAsync("/api/geometry/calculate-area", request);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var payload = await response.Content.ReadFromJsonAsync<CalculateAreaResponse>();
        var expectedEvenOddArea = GeoCalculations.ComputeAreaEvenOddRule(
        [
            new GeoPoint(39.0000, -89.0000),
            new GeoPoint(39.0100, -88.9900),
            new GeoPoint(39.0000, -88.9900),
            new GeoPoint(39.0100, -89.0000),
        ]);

        payload.Should().NotBeNull();
        payload!.HasIntersections.Should().BeTrue();
        payload.AreaSquareMeters.Should().BeApproximately(expectedEvenOddArea, 0.01);
        payload.NetAreaSquareMeters.Should().BeApproximately(expectedEvenOddArea, 0.01);
    }
}