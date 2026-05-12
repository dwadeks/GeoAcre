using SteelTree.GeoAcre.Web.Api.Models;

namespace SteelTree.GeoAcre.Web.Api.Services;

public sealed class LegalDescriptionProcessingResult
{
    public required int StatusCode { get; init; }

    public string? Error { get; init; }

    public string? Code { get; init; }

    public LegalDescriptionInterpretResponse? Response { get; init; }
}
