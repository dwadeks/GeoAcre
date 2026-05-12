namespace SteelTree.GeoAcre.Web.Api.Models;

public sealed class LegalDescriptionInterpretRequest
{
    public required LegalDescriptionSourceDto Source { get; set; }

    public LegalDescriptionInterpretOptionsDto? Options { get; set; }
}
