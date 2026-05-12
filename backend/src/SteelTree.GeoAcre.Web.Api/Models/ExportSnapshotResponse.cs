namespace SteelTree.GeoAcre.Web.Api.Models;

public sealed class ExportSnapshotResponse
{
    public required string SchemaVersion { get; set; }

    public required string Mode { get; set; }

    public required string ExportedAtUtc { get; set; }

    public required object Payload { get; set; }
}
