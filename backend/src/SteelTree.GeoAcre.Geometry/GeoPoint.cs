namespace SteelTree.GeoAcre.Geometry;

/// <summary>
/// Represents a geographic point with latitude and longitude coordinates.
/// </summary>
public record GeoPoint
{
    /// <summary>
    /// Latitude in decimal degrees (-90 to 90).
    /// </summary>
    public double Latitude { get; init; }

    /// <summary>
    /// Longitude in decimal degrees (-180 to 180).
    /// </summary>
    public double Longitude { get; init; }

    /// <summary>
    /// Creates a new GeoPoint with validated coordinates.
    /// </summary>
    /// <param name="latitude">Latitude (-90 to 90)</param>
    /// <param name="longitude">Longitude (-180 to 180)</param>
    /// <exception cref="InvalidCoordinateException">Thrown when coordinates are outside valid ranges</exception>
    public GeoPoint(double latitude, double longitude)
    {
        if (latitude < -90 || latitude > 90)
        {
            throw new InvalidCoordinateException(
                $"Latitude must be between -90 and 90. Received: {latitude}");
        }

        if (longitude < -180 || longitude > 180)
        {
            throw new InvalidCoordinateException(
                $"Longitude must be between -180 and 180. Received: {longitude}");
        }

        Latitude = latitude;
        Longitude = longitude;
    }
}
