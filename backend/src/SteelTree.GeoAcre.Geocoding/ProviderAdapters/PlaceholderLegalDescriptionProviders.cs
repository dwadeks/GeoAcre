using Microsoft.Extensions.Options;
using SteelTree.GeoAcre.Geometry;

namespace SteelTree.GeoAcre.Geocoding.ProviderAdapters;

public sealed class PlaceholderLegalDescriptionOcrService : ILegalDescriptionOcrService
{
    private readonly LegalDescriptionProviderOptions _options;

    public PlaceholderLegalDescriptionOcrService(IOptions<LegalDescriptionProviderOptions> options)
    {
        _options = options.Value;
    }

    public Task<OcrExtractionResult> ExtractTextAsync(
        LegalDescriptionSource source,
        CancellationToken cancellationToken = default)
    {
        if (source.Type != LegalInputType.UploadedImage)
        {
            return Task.FromResult(new OcrExtractionResult(
                false,
                string.Empty,
                ["OCR service only accepts uploaded image sources."],
                0));
        }

        if (source.ImageBytes is null || source.ImageBytes.Length == 0)
        {
            return Task.FromResult(new OcrExtractionResult(
                false,
                string.Empty,
                ["Uploaded image is empty or missing content."],
                0));
        }

        var extractedText = $"Placeholder OCR text from {_options.Ocr.Provider}: {source.FileName ?? "uploaded-image"}";
        return Task.FromResult(new OcrExtractionResult(true, extractedText, [], 0.25));
    }
}

public sealed class PlaceholderLegalDescriptionInterpreter : ILegalDescriptionInterpreter
{
    private readonly LegalDescriptionProviderOptions _options;

    public PlaceholderLegalDescriptionInterpreter(IOptions<LegalDescriptionProviderOptions> options)
    {
        _options = options.Value;
    }

    public Task<LegalInterpretationResult> InterpretAsync(
        string normalizedLegalText,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(normalizedLegalText))
        {
            return Task.FromResult(new LegalInterpretationResult(
                false,
                [],
                ["Legal description text is required for interpretation."],
                _options.Interpretation.Provider));
        }

        var boundary = new InterpretedBoundary(
            [
                new GeoPoint(39.7817, -89.6501),
                new GeoPoint(39.7820, -89.6510),
                new GeoPoint(39.7809, -89.6512),
            ],
            _options.Interpretation.DefaultConfidenceThreshold,
            ["Placeholder interpretation result. Replace with real provider implementation."]);

        return Task.FromResult(new LegalInterpretationResult(
            true,
            [boundary],
            [],
            _options.Interpretation.Provider));
    }
}