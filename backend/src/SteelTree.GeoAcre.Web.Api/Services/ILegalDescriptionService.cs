using SteelTree.GeoAcre.Web.Api.Models;

namespace SteelTree.GeoAcre.Web.Api.Services;

public interface ILegalDescriptionService
{
    Task<LegalDescriptionProcessingResult> InterpretAsync(
        LegalDescriptionInterpretRequest request,
        CancellationToken cancellationToken = default);
}
