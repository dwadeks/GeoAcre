namespace SteelTree.GeoAcre.Ocr.AzureDocumentIntelligence;

public sealed class AzureDocumentIntelligenceOcrService : ILegalDescriptionOcrService
{
    private readonly LegalDescriptionProviderOptions _options;
    private readonly ILogger<AzureDocumentIntelligenceOcrService> _logger;

    public AzureDocumentIntelligenceOcrService(
        IOptions<LegalDescriptionProviderOptions> options,
        ILogger<AzureDocumentIntelligenceOcrService> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public async Task<OcrExtractionResult> ExtractTextAsync(
        LegalDescriptionSource source,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (source.Type != LegalInputType.UploadedImage)
            {
                return new OcrExtractionResult(
                    false,
                    string.Empty,
                    ["Azure Document Intelligence OCR only accepts uploaded image sources."],
                    0);
            }

            if (source.ImageBytes is null || source.ImageBytes.Length == 0)
            {
                return new OcrExtractionResult(
                    false,
                    string.Empty,
                    ["Uploaded image is empty or missing content."],
                    0);
            }

            var endpoint = _options.Ocr.Endpoint;
            var apiKey = _options.Ocr.ApiKey;

            if (string.IsNullOrWhiteSpace(endpoint) || string.IsNullOrWhiteSpace(apiKey))
            {
                _logger.LogError("Azure Document Intelligence endpoint or API key is not configured.");
                return new OcrExtractionResult(
                    false,
                    string.Empty,
                    ["Azure Document Intelligence is not properly configured."],
                    0);
            }

            using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            cts.CancelAfter(TimeSpan.FromSeconds(_options.Ocr.TimeoutSeconds));

            var client = new DocumentAnalysisClient(new Uri(endpoint), new AzureKeyCredential(apiKey));
            using var imageStream = new MemoryStream(source.ImageBytes, writable: false);

            AnalyzeDocumentOperation operation = await client.AnalyzeDocumentAsync(
                WaitUntil.Completed,
                "prebuilt-read",
                imageStream,
                cancellationToken: cts.Token);

            AnalyzeResult result = operation.Value;
            var extractedText = result.Content?.Trim() ?? string.Empty;

            if (string.IsNullOrWhiteSpace(extractedText))
            {
                _logger.LogInformation("No text detected in image '{FileName}'.", source.FileName);
                return new OcrExtractionResult(
                    false,
                    string.Empty,
                    ["No text detected in the uploaded image."],
                    0);
            }

            var confidence = CalculateAverageConfidence(result);

            _logger.LogInformation(
                "Successfully extracted {CharacterCount} characters from image '{FileName}' with confidence {Confidence}.",
                extractedText.Length,
                source.FileName,
                confidence);

            return new OcrExtractionResult(
                true,
                extractedText,
                [],
                confidence);
        }
        catch (OperationCanceledException ex)
        {
            _logger.LogError(ex, "Azure Document Intelligence OCR request timed out for image '{FileName}'.", source.FileName);
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
            _logger.LogError(ex, "Unexpected error during Azure Document Intelligence OCR extraction for image '{FileName}'.", source.FileName);
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
