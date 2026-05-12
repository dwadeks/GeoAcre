using SteelTree.GeoAcre.Geocoding;

namespace SteelTree.GeoAcre.Ocr;

public interface ILegalDescriptionOcrService
{
    Task<OcrExtractionResult> ExtractTextAsync(
        LegalDescriptionSource source,
        CancellationToken cancellationToken = default);
}
