namespace SteelTree.GeoAcre.Geocoding;

using SteelTree.Ocr;

public sealed class LegalDescriptionOcrAdapter : ILegalDescriptionOcrService
{
    private readonly IOcrService _ocrService;

    public LegalDescriptionOcrAdapter(IOcrService ocrService)
    {
        _ocrService = ocrService ?? throw new ArgumentNullException(nameof(ocrService));
    }

    public async Task<OcrExtractionResult> ExtractTextAsync(
        LegalDescriptionSource source,
        CancellationToken cancellationToken = default)
    {
        // If the source is pasted text, return it directly without OCR
        if (source.Type == LegalInputType.PastedText)
        {
            if (string.IsNullOrWhiteSpace(source.Text))
            {
                return new OcrExtractionResult(
                    false,
                    string.Empty,
                    ["Pasted text is empty."],
                    1.0);
            }

            return new OcrExtractionResult(
                true,
                source.Text,
                [],
                1.0);
        }

        // If the source is an uploaded image, use the generic OCR service
        if (source.Type == LegalInputType.UploadedImage)
        {
            if (source.ImageBytes is null || source.ImageBytes.Length == 0)
            {
                return new OcrExtractionResult(
                    false,
                    string.Empty,
                    ["Uploaded image is empty or missing content."],
                    0);
            }

            var document = new OcrDocument(
                source.ImageBytes,
                source.FileName,
                source.ContentType);

            return await _ocrService.ExtractTextAsync(document, cancellationToken);
        }

        return new OcrExtractionResult(
            false,
            string.Empty,
            ["Unknown input type."],
            0);
    }
}
