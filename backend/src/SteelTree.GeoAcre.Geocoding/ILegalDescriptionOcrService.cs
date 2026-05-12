namespace SteelTree.GeoAcre.Geocoding;

using SteelTree.Ocr;

public interface ILegalDescriptionOcrService
{
    Task<OcrExtractionResult> ExtractTextAsync(
        LegalDescriptionSource source,
        CancellationToken cancellationToken = default);
}
