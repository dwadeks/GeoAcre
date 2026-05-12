namespace SteelTree.Ocr.AzureDocumentIntelligence.Tests;

[TestClass]
public class AzureDocumentIntelligenceOcrServiceTests
{
    [TestMethod]
    [TestCategory("Integration")]
    public async Task ExtractText_WithValidImageDocument_ReturnsExtractedText()
    {
        SkipIfNotConfigured();

        var service = CreateService();
        var document = BuildImageDocument("tract-ii.png");

        var result = await service.ExtractTextAsync(document);

        result.Success.Should().BeTrue();
        result.ExtractedText.Should().NotBeNullOrWhiteSpace();
        result.ExtractedText.Should().NotBeEmpty();
        result.Confidence.Should().BeGreaterThan(0);
    }

    [TestMethod]
    [TestCategory("Integration")]
    public async Task ExtractText_WithAnotherValidImageDocument_ReturnsExtractedText()
    {
        SkipIfNotConfigured();

        var service = CreateService();
        var document = BuildImageDocument("tract-iv.png");

        var result = await service.ExtractTextAsync(document);

        result.Success.Should().BeTrue();
        result.ExtractedText.Should().NotBeNullOrWhiteSpace();
        result.ExtractedText.Should().NotBeEmpty();
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

    private static OcrDocument BuildImageDocument(string fileName)
    {
        var imagePath = Path.Combine(AppContext.BaseDirectory, "TestData", fileName);
        var bytes = File.ReadAllBytes(imagePath);

        return new OcrDocument(bytes, fileName, "image/png");
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
