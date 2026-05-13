using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Options;
using SteelTree.GeoAcre.Geocoding;
using SteelTree.GeoAcre.Geocoding.ProviderAdapters;
using SteelTree.GeoAcre.Geometry;
using SteelTree.Ocr;
using SteelTree.GeoAcre.Web.Api.Models;

namespace SteelTree.GeoAcre.Web.Api.Tests;

[TestClass]
public class LegalDescriptionInterpretationIntegrationTests
{
    [TestMethod]
    public async Task Interpreter_WithAndWithoutTractPrefix_ProducesEquivalentGeometry()
    {
        var sample = LoadSample("tract-ii");
        var withPrefix = sample.Text;
        var withoutPrefix = withPrefix.Replace("Tract II:", string.Empty, StringComparison.OrdinalIgnoreCase).Trim();

        var interpreter = new PlaceholderLegalDescriptionInterpreter(
            Options.Create(new LegalDescriptionProviderOptions
            {
                Interpretation = new InterpretationProviderOptions
                {
                    Provider = "Placeholder",
                    DefaultConfidenceThreshold = 0.7,
                },
            }));

        var withPrefixResult = await interpreter.InterpretAsync(withPrefix);
        var withoutPrefixResult = await interpreter.InterpretAsync(withoutPrefix);

        withPrefixResult.Success.Should().BeTrue();
        withoutPrefixResult.Success.Should().BeTrue();
        withPrefixResult.Candidates.Should().HaveCount(1);
        withoutPrefixResult.Candidates.Should().HaveCount(1);
        withPrefixResult.Candidates[0].Vertices.Count.Should().BeGreaterThanOrEqualTo(4);
        withoutPrefixResult.Candidates[0].Vertices.Should().BeEquivalentTo(withPrefixResult.Candidates[0].Vertices, options => options.WithStrictOrdering());
    }

    [TestMethod]
    public async Task Interpret_WithFixtureTextSample_ReturnsReadOnlyBoundary()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var sample = LoadSample("tract-ii");
        var request = new LegalDescriptionInterpretRequest
        {
            Source = new LegalDescriptionSourceDto
            {
                Type = "PastedText",
                Text = sample.Text,
            },
        };

        var response = await client.PostAsJsonAsync("/api/legal-description/interpret", request);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var payload = await response.Content.ReadFromJsonAsync<LegalDescriptionInterpretResponse>();
        payload.Should().NotBeNull();
        payload!.Boundary.Should().NotBeNull();
        payload.Boundary!.IsReadOnly.Should().BeTrue();
        payload.Boundary.Provenance.Should().Be("LegalInterpretation");
    }

    [TestMethod]
    public async Task Interpret_WithFixtureImageSample_ReturnsReadOnlyBoundary()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var sample = LoadSample("tract-iv");
        var imagePath = Path.Combine(AppContext.BaseDirectory, "TestData", sample.Image.RelativePath.Replace('/', Path.DirectorySeparatorChar));
        var imageBytes = await File.ReadAllBytesAsync(imagePath);

        var request = new LegalDescriptionInterpretRequest
        {
            Source = new LegalDescriptionSourceDto
            {
                Type = "UploadedImage",
                FileName = sample.Image.FileName,
                ContentType = sample.Image.MimeType,
                Base64Content = Convert.ToBase64String(imageBytes),
            },
        };

        var response = await client.PostAsJsonAsync("/api/legal-description/interpret", request);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var payload = await response.Content.ReadFromJsonAsync<LegalDescriptionInterpretResponse>();
        payload.Should().NotBeNull();
        payload!.Interpretation.Status.Should().Be("Succeeded");
        payload.Boundary.Should().NotBeNull();
    }

    private static WebApplicationFactory<Program> CreateFactory()
    {
        return new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.RemoveAll<ILegalDescriptionOcrService>();
                    services.RemoveAll<ILegalDescriptionInterpreter>();
                    services.AddSingleton<ILegalDescriptionOcrService, FixtureOcrService>();
                    services.AddSingleton<ILegalDescriptionInterpreter, FixtureInterpreter>();
                });
            });
    }

    private static LegalDescriptionSample LoadSample(string id)
    {
        var jsonPath = Path.Combine(AppContext.BaseDirectory, "TestData", "legal-description-samples.json");
        var json = File.ReadAllText(jsonPath);
        var fixture = JsonSerializer.Deserialize<LegalDescriptionSamplesFixture>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
        });

        fixture.Should().NotBeNull();
        var sample = fixture!.Samples.Single(s => string.Equals(s.Id, id, StringComparison.OrdinalIgnoreCase));
        return sample;
    }

    private sealed class FixtureOcrService : ILegalDescriptionOcrService
    {
        public Task<OcrExtractionResult> ExtractTextAsync(LegalDescriptionSource source, CancellationToken cancellationToken = default)
        {
            var extracted = $"OCR::{source.FileName}";
            return Task.FromResult(new OcrExtractionResult(true, extracted, [], 0.9));
        }
    }

    private sealed class FixtureInterpreter : ILegalDescriptionInterpreter
    {
        public Task<LegalInterpretationResult> InterpretAsync(string normalizedLegalText, CancellationToken cancellationToken = default)
        {
            var boundary = new InterpretedBoundary(
            [
                new GeoPoint(37.0, -94.0),
                new GeoPoint(37.0, -94.005),
                new GeoPoint(37.005, -94.005),
                new GeoPoint(37.005, -94.0),
            ],
            0.95,
            [normalizedLegalText]);

            return Task.FromResult(new LegalInterpretationResult(true, [boundary], [], "FixtureInterpreter"));
        }
    }

    private sealed class LegalDescriptionSamplesFixture
    {
        public List<LegalDescriptionSample> Samples { get; set; } = [];
    }

    private sealed class LegalDescriptionSample
    {
        public string Id { get; set; } = string.Empty;

        public string Text { get; set; } = string.Empty;

        public LegalDescriptionImageMetadata Image { get; set; } = new();
    }

    private sealed class LegalDescriptionImageMetadata
    {
        public string FileName { get; set; } = string.Empty;

        public string RelativePath { get; set; } = string.Empty;

        public string MimeType { get; set; } = string.Empty;
    }
}
