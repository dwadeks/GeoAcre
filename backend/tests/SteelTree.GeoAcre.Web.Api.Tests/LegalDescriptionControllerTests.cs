using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using SteelTree.GeoAcre.Geometry;
using SteelTree.GeoAcre.Services;
using SteelTree.GeoAcre.Web.Api.Models;

namespace SteelTree.GeoAcre.Web.Api.Tests;

[TestClass]
public class LegalDescriptionControllerTests
{
    [TestMethod]
    public async Task Interpret_WhenServiceReturnsSuccess_ReturnsOk()
    {
        await using var factory = CreateFactory(_ => Task.FromResult(new LegalDescriptionProcessingResult
        {
            StatusCode = StatusCodes.Status200OK,
            Response = new LegalDescriptionInterpretationResult
            {
                Mode = "LegalDescription",
                SchemaVersion = "2.0.0",
                Status = "Succeeded",
                Confidence = 0.91,
                Diagnostics = [],
                Boundary = new LegalDescriptionBoundaryResult
                {
                    Provenance = "LegalInterpretation",
                    IsReadOnly = true,
                    Vertices =
                    [
                        new GeoPoint(37, -94),
                        new GeoPoint(37, -94.001),
                        new GeoPoint(37.001, -94.001),
                    ],
                    AreaSquareMeters = 100,
                    PerimeterMeters = 40,
                    HasSelfIntersection = false,
                },
            },
        }));

        var client = factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/legal-description/interpret", CreateTextRequest());

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var payload = await response.Content.ReadFromJsonAsync<LegalDescriptionInterpretResponse>();
        payload.Should().NotBeNull();
        payload!.Interpretation.Status.Should().Be("Succeeded");
        payload.Audit.Should().NotBeNull();
        payload.Audit!.ActiveMode.Should().Be("LegalDescription");
        payload.Audit.Provenance.Should().Be("LegalInterpretation");
    }

    [TestMethod]
    public async Task Interpret_WhenServiceReturnsRetry_ReturnsUnprocessableEntity()
    {
        await using var factory = CreateFactory(_ => Task.FromResult(new LegalDescriptionProcessingResult
        {
            StatusCode = StatusCodes.Status422UnprocessableEntity,
            Response = new LegalDescriptionInterpretationResult
            {
                Mode = "LegalDescription",
                SchemaVersion = "2.0.0",
                Status = "NeedsRetry",
                Confidence = 0.3,
                Diagnostics = ["Need clearer input"],
                Retry = new LegalDescriptionRetryGuidanceResult
                {
                    Allowed = true,
                    Message = "Retry with clearer input",
                },
            },
        }));

        var client = factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/legal-description/interpret", CreateTextRequest());

        response.StatusCode.Should().Be(HttpStatusCode.UnprocessableEntity);
    }

    [TestMethod]
    public async Task Interpret_WhenServiceReturnsValidationError_ReturnsBadRequest()
    {
        await using var factory = CreateFactory(_ => Task.FromResult(new LegalDescriptionProcessingResult
        {
            StatusCode = StatusCodes.Status400BadRequest,
            Error = "Exactly one input source is required",
            Code = "INVALID_INPUT_SOURCE",
        }));

        var client = factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/legal-description/interpret", CreateTextRequest());

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [TestMethod]
    public async Task Interpret_WhenProviderThrows_ReturnsServiceUnavailable()
    {
        await using var factory = CreateFactory(_ => throw new HttpRequestException("provider offline"));

        var client = factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/legal-description/interpret", CreateTextRequest());

        response.StatusCode.Should().Be(HttpStatusCode.ServiceUnavailable);
    }

    private static WebApplicationFactory<Program> CreateFactory(
        Func<LegalDescriptionInterpretCommand, Task<LegalDescriptionProcessingResult>> handler)
    {
        return new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.RemoveAll<ILegalDescriptionService>();
                    services.AddSingleton<ILegalDescriptionService>(new StubLegalDescriptionService(handler));
                });
            });
    }

    private static LegalDescriptionInterpretRequest CreateTextRequest()
    {
        return new LegalDescriptionInterpretRequest
        {
            Source = new LegalDescriptionSourceDto
            {
                Type = "PastedText",
                Text = "Beginning at the northwest corner...",
            },
        };
    }

    private sealed class StubLegalDescriptionService : ILegalDescriptionService
    {
        private readonly Func<LegalDescriptionInterpretCommand, Task<LegalDescriptionProcessingResult>> _handler;

        public StubLegalDescriptionService(Func<LegalDescriptionInterpretCommand, Task<LegalDescriptionProcessingResult>> handler)
        {
            _handler = handler;
        }

        public Task<LegalDescriptionProcessingResult> InterpretAsync(LegalDescriptionInterpretCommand request, CancellationToken cancellationToken = default)
        {
            return _handler(request);
        }
    }
}
