namespace SteelTree.Ocr;

public interface IOcrService
{
    Task<OcrExtractionResult> ExtractTextAsync(
        OcrDocument document,
        CancellationToken cancellationToken = default);
}
