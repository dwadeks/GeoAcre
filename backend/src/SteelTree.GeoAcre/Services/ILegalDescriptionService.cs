namespace SteelTree.GeoAcre.Services;

public interface ILegalDescriptionService
{
    Task<LegalDescriptionProcessingResult> InterpretAsync(
        LegalDescriptionInterpretCommand command,
        CancellationToken cancellationToken = default);
}
