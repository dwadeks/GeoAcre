using SteelTree.GeoAcre.Geocoding;
using SteelTree.GeoAcre.Geometry;
using SteelTree.GeoAcre.Web.Api.Models;
using SteelTree.GeoAcre.Web.Api.Services;
using Microsoft.AspNetCore.Http;

namespace SteelTree.GeoAcre.Web.Api.Tests;

[TestClass]
public class LegalDescriptionInputValidationTests
{
    [TestMethod]
    public async Task InterpretAsync_WithBothTextAndImageProperties_ReturnsBadRequest()
    {
        var service = CreateService();
        var request = new LegalDescriptionInterpretRequest
        {
            Source = new LegalDescriptionSourceDto
            {
                Type = "PastedText",
                Text = "Tract text",
                FileName = "tract.png",
                ContentType = "image/png",
                Base64Content = Convert.ToBase64String([1, 2, 3]),
            },
        };

        var result = await service.InterpretAsync(request);

        result.StatusCode.Should().Be(StatusCodes.Status400BadRequest);
        result.Code.Should().Be("INVALID_INPUT_SOURCE");
    }

    [TestMethod]
    public async Task InterpretAsync_WithValidPastedText_ReturnsSuccessResponse()
    {
        var service = CreateService();
        var request = new LegalDescriptionInterpretRequest
        {
            Source = new LegalDescriptionSourceDto
            {
                Type = "PastedText",
                Text = "Beginning at the northwest corner...",
            },
        };

        var result = await service.InterpretAsync(request);

        result.StatusCode.Should().Be(StatusCodes.Status200OK);
        result.Response.Should().NotBeNull();
        result.Response!.Interpretation.Status.Should().Be("Succeeded");
        result.Response.Boundary.Should().NotBeNull();
        result.Response.Boundary!.IsReadOnly.Should().BeTrue();
    }

    [TestMethod]
    public async Task InterpretAsync_WithUnreadableImage_ReturnsRetryResponse()
    {
        var service = new LegalDescriptionService(
            new FailingOcrService(),
            new FakeInterpreter(),
            new LegalDescriptionBoundaryMapper());

        var request = new LegalDescriptionInterpretRequest
        {
            Source = new LegalDescriptionSourceDto
            {
                Type = "UploadedImage",
                FileName = "tract.svg",
                ContentType = "image/svg+xml",
                Base64Content = Convert.ToBase64String("fake image bytes"u8.ToArray()),
            },
        };

        var result = await service.InterpretAsync(request);

        result.StatusCode.Should().Be(StatusCodes.Status422UnprocessableEntity);
        result.Response.Should().NotBeNull();
        result.Response!.Interpretation.Status.Should().Be("NeedsRetry");
        result.Response.Retry.Should().NotBeNull();
        result.Response.Retry!.Allowed.Should().BeTrue();
    }

    private static LegalDescriptionService CreateService()
    {
        return new LegalDescriptionService(
            new FakeOcrService(),
            new FakeInterpreter(),
            new LegalDescriptionBoundaryMapper());
    }

    private sealed class FakeOcrService : ILegalDescriptionOcrService
    {
        public Task<OcrExtractionResult> ExtractTextAsync(LegalDescriptionSource source, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(new OcrExtractionResult(true, "Normalized legal text", [], 0.9));
        }
    }

    private sealed class FailingOcrService : ILegalDescriptionOcrService
    {
        public Task<OcrExtractionResult> ExtractTextAsync(LegalDescriptionSource source, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(new OcrExtractionResult(false, string.Empty, ["Image unreadable"], 0.2));
        }
    }

    private sealed class FakeInterpreter : ILegalDescriptionInterpreter
    {
        public Task<LegalInterpretationResult> InterpretAsync(string normalizedLegalText, CancellationToken cancellationToken = default)
        {
            var boundary = new InterpretedBoundary(
            [
                new GeoPoint(37.0, -94.0),
                new GeoPoint(37.0, -94.001),
                new GeoPoint(37.001, -94.001),
            ],
            0.88,
            []);

            return Task.FromResult(new LegalInterpretationResult(true, [boundary], [], "FakeInterpreter"));
        }
    }
}
