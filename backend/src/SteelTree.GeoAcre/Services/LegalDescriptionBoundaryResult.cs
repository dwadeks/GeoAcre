using SteelTree.GeoAcre.Geometry;

namespace SteelTree.GeoAcre.Services;

public sealed class LegalDescriptionBoundaryResult
{
    public required string Provenance { get; set; }

    public required bool IsReadOnly { get; set; }

    public required IReadOnlyList<GeoPoint> Vertices { get; set; }

    public required double AreaSquareMeters { get; set; }

    public required double PerimeterMeters { get; set; }

    public required bool HasSelfIntersection { get; set; }
}
