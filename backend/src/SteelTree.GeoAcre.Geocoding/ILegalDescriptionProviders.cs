namespace SteelTree.GeoAcre.Geocoding;

public interface ILegalDescriptionOcrService
{
    Task<OcrExtractionResult> ExtractTextAsync(
        LegalDescriptionSource source,
        CancellationToken cancellationToken = default);
}

public interface ILegalDescriptionInterpreter
{
    Task<LegalInterpretationResult> InterpretAsync(
        string normalizedLegalText,
        CancellationToken cancellationToken = default);
}