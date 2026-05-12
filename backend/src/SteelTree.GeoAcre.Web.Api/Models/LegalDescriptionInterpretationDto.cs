namespace SteelTree.GeoAcre.Web.Api.Models;

public sealed class LegalDescriptionInterpretationDto
{
    public required string Status { get; set; }

    public required double Confidence { get; set; }

    public required string[] Diagnostics { get; set; }
}
