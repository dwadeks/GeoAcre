namespace SteelTree.GeoAcre.Geometry;

/// <summary>
/// Exception thrown when a polygon is invalid.
/// </summary>
public class InvalidPolygonException : InvalidOperationException
{
    public InvalidPolygonException(string message) : base(message) { }
}
