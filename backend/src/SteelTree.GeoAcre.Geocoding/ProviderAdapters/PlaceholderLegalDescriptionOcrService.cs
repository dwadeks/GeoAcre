using Microsoft.Extensions.Options;
using SteelTree.GeoAcre.Geocoding;
using SteelTree.Ocr;

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
