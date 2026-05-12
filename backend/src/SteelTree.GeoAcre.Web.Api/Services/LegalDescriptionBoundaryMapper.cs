using SteelTree.GeoAcre.Geocoding;
using SteelTree.GeoAcre.Geometry;
using SteelTree.GeoAcre.Web.Api.Models;

namespace SteelTree.GeoAcre.Web.Api.Services;

public sealed class LegalDescriptionBoundaryMapper : ILegalDescriptionBoundaryMapper
{
    public LegalDescriptionBoundaryDto Map(InterpretedBoundary boundary)
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

        return new LegalDescriptionBoundaryDto
        {
            Provenance = "LegalInterpretation",
            IsReadOnly = true,
            Vertices = [.. polygon.Vertices.Select(v => new LatLngDto { Latitude = v.Latitude, Longitude = v.Longitude })],
            AreaSquareMeters = areaSquareMeters,
            PerimeterMeters = polygon.ComputedPerimeterMeters,
            HasSelfIntersection = hasIntersections,
        };
    }
}
