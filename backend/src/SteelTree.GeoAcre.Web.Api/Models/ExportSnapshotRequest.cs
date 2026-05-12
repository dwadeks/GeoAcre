namespace SteelTree.GeoAcre.Web.Api.Models;

public sealed class ExportSnapshotRequest
{
    public required string ActiveMode { get; set; }

    public required ExportSnapshotStateDto State { get; set; }
}
