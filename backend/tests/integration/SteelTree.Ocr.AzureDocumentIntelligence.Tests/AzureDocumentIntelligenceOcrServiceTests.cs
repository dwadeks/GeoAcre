namespace SteelTree.Ocr.AzureDocumentIntelligence.Tests;

[TestClass]
public class AzureDocumentIntelligenceOcrServiceTests
{
    [TestMethod]
    [TestCategory("Integration")]
    public async Task ExtractText_WithValidTractIIDocument_ReturnsExpectedLegalDescription()
    {
        SkipIfNotConfigured();

        var service = CreateService();
        var source = BuildImageSource("tract-ii.png");

        var result = await service.ExtractTextAsync(source);

        result.Success.Should().BeTrue();
        result.ExtractedText.Should().NotBeNullOrWhiteSpace();
        result.ExtractedText.ToUpperInvariant().Should().Contain("TRACT");
        result.ExtractedText.ToUpperInvariant().Should().Contain("LOT");
        result.Confidence.Should().BeGreaterThan(0);
    }

    [TestMethod]
    [TestCategory("Integration")]
    public async Task ExtractText_WithValidTractIVDocument_ReturnsExpectedLegalDescription()
    {
        SkipIfNotConfigured();

        var service = CreateService();
        var source = BuildImageSource("tract-iv.png");

        var result = await service.ExtractTextAsync(source);

        result.Success.Should().BeTrue();
        result.ExtractedText.Should().NotBeNullOrWhiteSpace();
        result.ExtractedText.ToUpperInvariant().Should().Contain("SECTION");
        result.ExtractedText.ToUpperInvariant().Should().Contain("RANGE");
        result.Confidence.Should().BeGreaterThan(0);
    }

    private static AzureDocumentIntelligenceOcrService CreateService()
    {
        var options = new OcrProviderOptions
        {
            Provider = "AzureDocumentIntelligence",
            Endpoint = GetRequiredEnvironmentVariable("AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT"),
            ApiKey = GetRequiredEnvironmentVariable("AZURE_DOCUMENT_INTELLIGENCE_API_KEY"),
            TimeoutSeconds = 60,
        };

        return new AzureDocumentIntelligenceOcrService(
            Options.Create(options),
            NullLogger<AzureDocumentIntelligenceOcrService>.Instance);
    }

    private static LegalDescriptionSource BuildImageSource(string fileName)
    {
        var imagePath = Path.Combine(AppContext.BaseDirectory, "TestData", fileName);
        var bytes = File.ReadAllBytes(imagePath);

        return new LegalDescriptionSource(
            LegalInputType.UploadedImage,
            null,
            fileName,
            "image/png",
            bytes);
    }

    private static void SkipIfNotConfigured()
    {
        var endpoint = Environment.GetEnvironmentVariable("AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT");
        var key = Environment.GetEnvironmentVariable("AZURE_DOCUMENT_INTELLIGENCE_API_KEY");

        if (string.IsNullOrWhiteSpace(endpoint) || string.IsNullOrWhiteSpace(key))
        {
            Assert.Inconclusive(
                "Integration test requires AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT and AZURE_DOCUMENT_INTELLIGENCE_API_KEY.");
        }
    }

    private static string GetRequiredEnvironmentVariable(string name)
    {
        var value = Environment.GetEnvironmentVariable(name);
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new InvalidOperationException($"Environment variable '{name}' is required.");
        }

        return value;
    }
}
