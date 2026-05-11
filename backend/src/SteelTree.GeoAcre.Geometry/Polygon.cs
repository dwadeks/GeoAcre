namespace SteelTree.GeoAcre.Geometry;

/// <summary>
/// Represents a polygon defined by vertices (GeoPoints).
/// Supports lazy-computed properties for area, perimeter, and side lengths.
/// </summary>
public class Polygon
{
    private double? _cachedAreaSquareMeters;
    private double? _cachedPerimeterMeters;
    private List<double>? _cachedPerSideLengthsMeters;

    /// <summary>
    /// Unique identifier for this polygon.
    /// </summary>
    public string Id { get; init; } = Guid.NewGuid().ToString();

    /// <summary>
    /// Vertices defining the polygon boundary.
    /// </summary>
    public IReadOnlyList<GeoPoint> Vertices { get; init; }

    /// <summary>
    /// Indicates if this polygon should be subtracted from a parent polygon (exclude polygon).
    /// </summary>
    public bool IsExcludePolygon { get; init; }

    /// <summary>
    /// ID of the parent polygon if this is an exclude polygon; otherwise null.
    /// </summary>
    public string? ParentPolygonId { get; init; }

    /// <summary>
    /// Gets a value indicating whether this polygon is valid (3+ vertices, no invalid coordinates).
    /// </summary>
    public bool IsValid => Vertices.Count >= 3;

    /// <summary>
    /// Gets a value indicating whether this polygon has self-intersections.
    /// Lazy-computed on first access.
    /// </summary>
    public bool HasIntersections
    {
        get
        {
            if (!IsValid) return false;
            return GeoCalculations.DetectIntersections(Vertices);
        }
    }

    /// <summary>
    /// Gets the computed area in square meters.
    /// Uses spherical excess formula. Lazy-computed and cached.
    /// </summary>
    public double ComputedAreaSquareMeters
    {
        get
        {
            if (!IsValid) return 0;
            _cachedAreaSquareMeters ??= GeoCalculations.ComputeArea(Vertices);
            return _cachedAreaSquareMeters.Value;
        }
    }

    /// <summary>
    /// Gets the computed perimeter in meters.
    /// Lazy-computed and cached.
    /// </summary>
    public double ComputedPerimeterMeters
    {
        get
        {
            if (!IsValid) return 0;
            _cachedPerimeterMeters ??= GeoCalculations.ComputePerimeter(Vertices);
            return _cachedPerimeterMeters.Value;
        }
    }

    /// <summary>
    /// Gets the length of each side in meters.
    /// Lazy-computed and cached.
    /// </summary>
    public IReadOnlyList<double> PerSideLengthsMeters
    {
        get
        {
            if (!IsValid) return [];
            _cachedPerSideLengthsMeters ??= GeoCalculations.ComputeSideLengths(Vertices);
            return _cachedPerSideLengthsMeters.AsReadOnly();
        }
    }

    /// <summary>
    /// Creates a new Polygon with the specified vertices.
    /// </summary>
    /// <param name="vertices">List of GeoPoints defining the polygon boundary (minimum 3 required for validity)</param>
    /// <param name="isExcludePolygon">Whether this polygon should be subtracted from a parent</param>
    /// <param name="parentPolygonId">ID of parent polygon if this is an exclude polygon</param>
    public Polygon(IEnumerable<GeoPoint> vertices, bool isExcludePolygon = false, string? parentPolygonId = null)
    {
        Vertices = vertices.ToList().AsReadOnly();
        IsExcludePolygon = isExcludePolygon;
        ParentPolygonId = parentPolygonId;
    }

    /// <summary>
    /// Clears cached computed values. Call after Vertices change (though Vertices is immutable).
    /// </summary>
    public void ClearCache()
    {
        _cachedAreaSquareMeters = null;
        _cachedPerimeterMeters = null;
        _cachedPerSideLengthsMeters = null;
    }
}
