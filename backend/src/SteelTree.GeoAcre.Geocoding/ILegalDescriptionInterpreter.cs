namespace SteelTree.GeoAcre.Geocoding;

public interface ILegalDescriptionInterpreter
{
    Task<LegalInterpretationResult> InterpretAsync(
        string normalizedLegalText,
        CancellationToken cancellationToken = default);
}
