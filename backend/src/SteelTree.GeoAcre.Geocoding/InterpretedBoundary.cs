using SteelTree.GeoAcre.Geometry;

namespace SteelTree.GeoAcre.Geocoding;

public sealed record InterpretedBoundary(
    IReadOnlyList<GeoPoint> Vertices,
    double Confidence,
    IReadOnlyList<string> Diagnostics);
