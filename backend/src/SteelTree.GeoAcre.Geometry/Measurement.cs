namespace SteelTree.GeoAcre.Geometry;

/// <summary>
/// Represents a distance measurement defined by a series of vertices (polyline).
/// </summary>
public class Measurement
{
    private double? _cachedTotalDistanceMeters;
    private List<double>? _cachedPerSegmentDistancesMeters;

    /// <summary>
    /// Unique identifier for this measurement.
    /// </summary>
    public string Id { get; init; } = Guid.NewGuid().ToString();

    /// <summary>
    /// Vertices defining the measurement polyline.
    /// </summary>
    public IReadOnlyList<GeoPoint> Vertices { get; init; }

    /// <summary>
    /// Gets a value indicating whether this measurement is valid (2+ vertices for a segment).
    /// </summary>
    public bool IsValid => Vertices.Count >= 2;

    /// <summary>
    /// Gets the total distance in meters.
    /// Lazy-computed and cached.
    /// </summary>
    public double TotalDistanceMeters
    {
        get
        {
            if (!IsValid) return 0;
            _cachedTotalDistanceMeters ??= GeoCalculations.ComputePolylineDistance(Vertices);
            return _cachedTotalDistanceMeters.Value;
        }
    }

    /// <summary>
    /// Gets the distance of each segment in meters.
    /// Lazy-computed and cached.
    /// </summary>
    public IReadOnlyList<double> PerSegmentDistancesMeters
    {
        get
        {
            if (!IsValid) return [];
            _cachedPerSegmentDistancesMeters ??= GeoCalculations.ComputeSegmentDistances(Vertices);
            return _cachedPerSegmentDistancesMeters.AsReadOnly();
        }
    }

    /// <summary>
    /// Creates a new Measurement with the specified vertices.
    /// </summary>
    /// <param name="vertices">List of GeoPoints defining the measurement polyline (minimum 2 required for validity)</param>
    public Measurement(IEnumerable<GeoPoint> vertices)
    {
        Vertices = vertices.ToList().AsReadOnly();
    }

    /// <summary>
    /// Clears cached computed values.
    /// </summary>
    public void ClearCache()
    {
        _cachedTotalDistanceMeters = null;
        _cachedPerSegmentDistancesMeters = null;
    }
}
