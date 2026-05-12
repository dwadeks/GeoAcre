namespace SteelTree.GeoAcre.Web.Api.Models;

public sealed class LegalDescriptionInterpretResponse
{
    public required string Mode { get; set; }

    public required string SchemaVersion { get; set; }

    public required LegalDescriptionInterpretationDto Interpretation { get; set; }

    public LegalDescriptionBoundaryDto? Boundary { get; set; }

    public RetryGuidanceDto? Retry { get; set; }
}
