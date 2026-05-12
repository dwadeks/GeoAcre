namespace SteelTree.GeoAcre.Geocoding;

public interface ILegalDescriptionOcrService
{
    Task<OcrExtractionResult> ExtractTextAsync(
        LegalDescriptionSource source,
        CancellationToken cancellationToken = default);
}
