namespace SteelTree.GeoAcre.Web.Api.Models;

public sealed class LegalDescriptionBoundaryDto
{
    public required string Provenance { get; set; }

    public required bool IsReadOnly { get; set; }

    public required LatLngDto[] Vertices { get; set; }

    public required double AreaSquareMeters { get; set; }

    public required double PerimeterMeters { get; set; }

    public required bool HasSelfIntersection { get; set; }
}
