namespace SteelTree.GeoAcre.Web.Api.Models;

/// <summary>
/// Request DTO for geometry area calculation.
/// </summary>
public class CalculateAreaRequest
{
    /// <summary>
    /// Primary polygon vertices in order (latitude, longitude).
    /// </summary>
    public required LatLngDto[] Vertices { get; set; }

    /// <summary>
    /// Optional list of exclude polygons to subtract from the primary polygon.
    /// </summary>
    public LatLngDto[][]? ExcludePolygons { get; set; }
}

/// <summary>
/// Response DTO for geometry area calculation.
/// </summary>
public class CalculateAreaResponse
{
    /// <summary>
    /// Area of the primary polygon in square meters.
    /// </summary>
    public required double AreaSquareMeters { get; set; }

    /// <summary>
    /// Net area after subtracting excludes in square meters.
    /// </summary>
    public double NetAreaSquareMeters { get; set; }

    /// <summary>
    /// Total area of all exclude polygons in square meters.
    /// </summary>
    public double ExcludedAreaSquareMeters { get; set; }

    /// <summary>
    /// Length of each side of the primary polygon in meters.
    /// </summary>
    public required double[] PerSideLengthsMeters { get; set; }

    /// <summary>
    /// Whether the primary polygon has self-intersections.
    /// </summary>
    public required bool HasIntersections { get; set; }
}

/// <summary>
/// Request DTO for geocoding search.
/// </summary>
public class GeocodeSearchRequest
{
    /// <summary>
    /// Search query (address or place name).
    /// </summary>
    public required string Query { get; set; }

    /// <summary>
    /// Maximum number of results to return.
    /// </summary>
    public int MaxResults { get; set; } = 10;
}

/// <summary>
/// Response DTO for geocoding search result.
/// </summary>
public class GeocodeSearchResponse
{
    /// <summary>
    /// List of search results.
    /// </summary>
    public required GeocodeResult[] Results { get; set; }
}

/// <summary>
/// Individual geocoding result.
/// </summary>
public class GeocodeResult
{
    /// <summary>
    /// Unique identifier for this result.
    /// </summary>
    public required string Id { get; set; }

    /// <summary>
    /// Display name of the location.
    /// </summary>
    public required string DisplayName { get; set; }

    /// <summary>
    /// Latitude of the location.
    /// </summary>
    public required double Latitude { get; set; }

    /// <summary>
    /// Longitude of the location.
    /// </summary>
    public required double Longitude { get; set; }

    /// <summary>
    /// Bounding box of the location (min_lat, max_lat, min_lon, max_lon).
    /// </summary>
    public double[]? BoundingBox { get; set; }
}

/// <summary>
/// Request DTO for reverse geocoding.
/// </summary>
public class ReverseGeocodeRequest
{
    /// <summary>
    /// Latitude of the location.
    /// </summary>
    public required double Latitude { get; set; }

    /// <summary>
    /// Longitude of the location.
    /// </summary>
    public required double Longitude { get; set; }
}

/// <summary>
/// Response DTO for reverse geocoding.
/// </summary>
public class ReverseGeocodeResponse
{
    /// <summary>
    /// Formatted address string.
    /// </summary>
    public required string Address { get; set; }

    /// <summary>
    /// Latitude of the location.
    /// </summary>
    public required double Latitude { get; set; }

    /// <summary>
    /// Longitude of the location.
    /// </summary>
    public required double Longitude { get; set; }
}

/// <summary>
/// Latitude/Longitude coordinate pair.
/// </summary>
public class LatLngDto
{
    /// <summary>
    /// Latitude (-90 to 90).
    /// </summary>
    public required double Latitude { get; set; }

    /// <summary>
    /// Longitude (-180 to 180).
    /// </summary>
    public required double Longitude { get; set; }
}
