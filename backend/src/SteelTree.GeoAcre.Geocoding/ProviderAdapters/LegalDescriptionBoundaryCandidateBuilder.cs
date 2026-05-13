using SteelTree.GeoAcre.Geometry;

namespace SteelTree.GeoAcre.Geocoding.ProviderAdapters;

public sealed class LegalDescriptionBoundaryCandidateBuilder
{
    private const double FeetToDegrees = 1.0 / 364000.0;
    private const double OriginLatitude = 37.0;
    private const double OriginLongitude = -94.0;

    public IReadOnlyList<GeoPoint> Build(IReadOnlyList<LegalDescriptionCourseParser.CourseClause> courses)
    {
        var vertices = new List<GeoPoint>();
        if (courses.Count == 0)
        {
            return vertices;
        }

        var currentLatitude = OriginLatitude;
        var currentLongitude = OriginLongitude;
        vertices.Add(new GeoPoint(currentLatitude, currentLongitude));

        foreach (var course in courses)
        {
            var (deltaLatitude, deltaLongitude) = ConvertDirectionToDelta(course.Direction, course.DistanceFeet);
            currentLatitude += deltaLatitude;
            currentLongitude += deltaLongitude;
            vertices.Add(new GeoPoint(currentLatitude, currentLongitude));
        }

        if (vertices.Count >= 4)
        {
            vertices.RemoveAt(vertices.Count - 1);
        }

        return vertices;
    }

    private static (double DeltaLatitude, double DeltaLongitude) ConvertDirectionToDelta(string direction, double distanceFeet)
    {
        var step = distanceFeet * FeetToDegrees;

        return direction switch
        {
            "North" => (step, 0),
            "South" => (-step, 0),
            "East" => (0, step),
            "West" => (0, -step),
            "Northeast" => (step * 0.70710678, step * 0.70710678),
            "Northwest" => (step * 0.70710678, -step * 0.70710678),
            "Southeast" => (-step * 0.70710678, step * 0.70710678),
            "Southwest" => (-step * 0.70710678, -step * 0.70710678),
            _ => (0, 0),
        };
    }
}