namespace SteelTree.GeoAcre.Geometry;

/// <summary>
/// Exception thrown when a coordinate is invalid.
/// </summary>
public class InvalidCoordinateException : ArgumentException
{
    public InvalidCoordinateException(string message) : base(message) { }
}
