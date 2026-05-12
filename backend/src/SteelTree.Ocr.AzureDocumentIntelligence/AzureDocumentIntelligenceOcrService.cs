namespace SteelTree.Ocr.AzureDocumentIntelligence;

public sealed class AzureDocumentIntelligenceOcrService : IOcrService
{
    private readonly OcrProviderOptions _options;
    private readonly ILogger<AzureDocumentIntelligenceOcrService> _logger;

    public AzureDocumentIntelligenceOcrService(
        IOptions<OcrProviderOptions> options,
        ILogger<AzureDocumentIntelligenceOcrService> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public async Task<OcrExtractionResult> ExtractTextAsync(
        OcrDocument document,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (document.ImageBytes is null || document.ImageBytes.Length == 0)
            {
                return new OcrExtractionResult(
                    false,
                    string.Empty,
                    ["Image is empty or missing content."],
                    0);
            }

            if (string.IsNullOrWhiteSpace(_options.Endpoint) || string.IsNullOrWhiteSpace(_options.ApiKey))
            {
                _logger.LogError("Azure Document Intelligence endpoint or API key is not configured.");
                return new OcrExtractionResult(
                    false,
                    string.Empty,
                    ["Azure Document Intelligence is not properly configured."],
                    0);
            }

            using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            cts.CancelAfter(TimeSpan.FromSeconds(_options.TimeoutSeconds));

            var client = new DocumentAnalysisClient(new Uri(_options.Endpoint), new AzureKeyCredential(_options.ApiKey));
            using var imageStream = new MemoryStream(document.ImageBytes, writable: false);

            AnalyzeDocumentOperation operation = await client.AnalyzeDocumentAsync(
                WaitUntil.Completed,
                "prebuilt-read",
                imageStream,
                cancellationToken: cts.Token);

            AnalyzeResult result = operation.Value;
            var extractedText = result.Content?.Trim() ?? string.Empty;

            if (string.IsNullOrWhiteSpace(extractedText))
            {
                _logger.LogInformation("No text detected in image '{FileName}'.", document.FileName);
                return new OcrExtractionResult(
                    false,
                    string.Empty,
                    ["No text detected in the image."],
                    0);
            }

            var confidence = CalculateAverageConfidence(result);

            _logger.LogInformation(
                "Successfully extracted {CharacterCount} characters from image '{FileName}' with confidence {Confidence}.",
                extractedText.Length,
                document.FileName,
                confidence);

            return new OcrExtractionResult(
                true,
                extractedText,
                [],
                confidence);
        }
        catch (OperationCanceledException ex)
        {
            _logger.LogError(ex, "Azure Document Intelligence OCR request timed out for image '{FileName}'.", document.FileName);
            return new OcrExtractionResult(
                false,
                string.Empty,
                ["OCR request timed out. Please try again with a smaller image."],
                0);
        }
        catch (RequestFailedException ex)
        {
            _logger.LogError(ex, "Azure Document Intelligence API returned error: {StatusCode} - {Message}", ex.Status, ex.Message);
            return new OcrExtractionResult(false, string.Empty, GetDiagnosticsForStatusCode(ex.Status), 0);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during Azure Document Intelligence OCR extraction for image '{FileName}'.", document.FileName);
            return new OcrExtractionResult(
                false,
                string.Empty,
                [$"Unexpected error during OCR: {ex.Message}"],
                0);
        }
    }

    private static double CalculateAverageConfidence(AnalyzeResult result)
    {
        var words = result.Pages
            .SelectMany(page => page.Words)
            .ToList();

        if (words.Count == 0)
        {
            return 0;
        }

        return words.Average(word => (double)word.Confidence);
    }

    private static IReadOnlyList<string> GetDiagnosticsForStatusCode(int statusCode)
    {
        return statusCode switch
        {
            400 => ["Invalid image format or corrupted file. Supported formats include JPEG, PNG, BMP, TIFF, and PDF."],
            401 => ["Azure Document Intelligence credentials are invalid."],
            403 => ["Access denied. Check your subscription status or network restrictions."],
            404 => ["Azure Document Intelligence endpoint not found."],
            429 => ["Rate limit exceeded. Please try again later."],
            500 => ["Azure Document Intelligence service encountered an error. Please try again."],
            _ => [$"Azure Document Intelligence error: HTTP {statusCode}"]
        };
    }
}
