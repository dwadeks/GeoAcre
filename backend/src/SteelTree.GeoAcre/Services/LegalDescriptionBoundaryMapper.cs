using SteelTree.GeoAcre.Geocoding;
using SteelTree.GeoAcre.Geometry;

namespace SteelTree.GeoAcre.Services;

public sealed class LegalDescriptionBoundaryMapper : ILegalDescriptionBoundaryMapper
{
    public LegalDescriptionBoundaryResult Map(InterpretedBoundary boundary)
    {
        if (boundary.Vertices.Count < 3)
        {
            throw new ArgumentException("Interpreted boundary must have at least 3 vertices.");
        }

        var polygon = new Polygon(boundary.Vertices, false, null);
        var hasIntersections = polygon.HasIntersections;

        var areaSquareMeters = hasIntersections
            ? GeoCalculations.ComputeAreaEvenOddRule(polygon.Vertices)
            : polygon.ComputedAreaSquareMeters;

        return new LegalDescriptionBoundaryResult
        {
            Provenance = "LegalInterpretation",
            IsReadOnly = true,
            Vertices = polygon.Vertices,
            AreaSquareMeters = areaSquareMeters,
            PerimeterMeters = polygon.ComputedPerimeterMeters,
            HasSelfIntersection = hasIntersections,
        };
    }
}
