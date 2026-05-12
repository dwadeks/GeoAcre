namespace SteelTree.GeoAcre.Web.Api.Models;

public sealed class ModeAuditMetadataDto
{
    public required string ActiveMode { get; set; }

    public string? Provenance { get; set; }
}
