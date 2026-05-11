# Library Contract: SteelTree.GeoAcre.Geometry

**Version**: 1.0.0  
**Language**: C# / .NET 10  
**Namespace**: `SteelTree.GeoAcre.Geometry`  
**Purpose**: Geodetic calculations for area, distance, and polygon operations  
**Quality Gates**: All public methods require unit tests; geodetic accuracy ≥ 99.5%

---

## Public API Surface

### Namespace: `SteelTree.GeoAcre.Geometry`

#### Record: GeoPoint

```csharp
public record GeoPoint(double Latitude, double Longitude)
{
    /// <summary>
    /// Creates a validated GeoPoint.
    /// Throws ArgumentOutOfRangeException if coordinates are invalid.
    /// </summary>
    public GeoPoint(double lat, double lon);
}
```

**Validation**:
- Latitude: [-90, 90]
- Longitude: [-180, 180]

---

#### Class: Polygon

```csharp
public class Polygon
{
    public string Id { get; init; }
    public List<GeoPoint> Vertices { get; init; }
    public bool IsExcludePolygon { get; init; }
    public string? ParentPolygonId { get; init; }
    
    /// <summary>
    /// True if polygon has ≥3 vertices.
    /// </summary>
    public bool IsValid { get; }
    
    /// <summary>
    /// True if any two sides of the polygon intersect (self-intersecting polygon).
    /// Uses sweep-line algorithm; O(n log n).
    /// </summary>
    public bool HasIntersections { get; }
    
    /// <summary>
    /// Geodetic area in square meters.
    /// Uses spherical excess formula; accurate to <0.5% for areas up to 1,000,000 m².
    /// For self-intersecting polygons, uses even-odd fill rule.
    /// </summary>
    public double ComputedAreaSquareMeters { get; }
    
    /// <summary>
    /// Perimeter in meters; sum of all side lengths.
    /// </summary>
    public double ComputedPerimeterMeters { get; }
    
    /// <summary>
    /// Length of each side in meters, in vertex order.
    /// </summary>
    public List<double> PerSideLengthsMeters { get; }
}
```

---

#### Class: Measurement

```csharp
public class Measurement
{
    public string Id { get; init; }
    public List<GeoPoint> Vertices { get; init; }
    
    /// <summary>
    /// True if measurement has ≥2 vertices.
    /// </summary>
    public bool IsValid { get; }
    
    /// <summary>
    /// Total distance along the polyline in meters.
    /// Uses Haversine or Vincenty ellipsoid formula; accurate to <0.5% for distances <10 miles.
    /// </summary>
    public double TotalDistanceMeters { get; }
    
    /// <summary>
    /// Distance of each segment (from vertex i to i+1) in meters.
    /// </summary>
    public List<double> PerSegmentDistancesMeters { get; }
}
```

---

#### Static Class: GeoCalculations

Core geodetic algorithms.

```csharp
public static class GeoCalculations
{
    /// <summary>
    /// Calculate geodetic distance between two points in meters.
    /// Uses Haversine formula; accurate to ~0.5 meters.
    /// </summary>
    public static double Distance(GeoPoint from, GeoPoint to);
    
    /// <summary>
    /// Calculate geodetic area of a polygon in square meters.
    /// Uses spherical excess; accurate to <0.5% for reasonable polygon sizes.
    /// For self-intersecting polygons, uses even-odd fill rule.
    /// </summary>
    public static double ComputeArea(IEnumerable<GeoPoint> vertices);
    
    /// <summary>
    /// Detect if polygon sides intersect (self-intersecting).
    /// Returns true if any two non-adjacent sides cross.
    /// Uses sweep-line algorithm; O(n log n).
    /// </summary>
    public static bool DetectIntersections(IEnumerable<GeoPoint> vertices);
    
    /// <summary>
    /// Calculate perimeter of a polygon (sum of all side lengths) in meters.
    /// </summary>
    public static double ComputePerimeter(IEnumerable<GeoPoint> vertices);
    
    /// <summary>
    /// Calculate polygon area using the even-odd fill rule.
    /// Handles self-intersecting polygons; result is sum of regions with odd crossing count.
    /// </summary>
    public static double ComputeAreaEvenOddRule(IEnumerable<GeoPoint> vertices);
    
    /// <summary>
    /// Check if a point is inside a polygon using ray-casting.
    /// </summary>
    public static bool IsPointInPolygon(GeoPoint point, IEnumerable<GeoPoint> polygonVertices);
    
    /// <summary>
    /// Compute intersection of two polygons (where exclude polygon overlaps primary polygon).
    /// Returns list of intersection vertices (GeoJSON MultiPolygon format).
    /// </summary>
    public static IEnumerable<GeoPoint> ComputeIntersection(
        IEnumerable<GeoPoint> primaryVertices,
        IEnumerable<GeoPoint> excludeVertices);
}
```

---

#### Static Class: UnitConversion

Unit conversion utilities.

```csharp
public static class UnitConversion
{
    // Area conversions
    public static double SquareMetersToAcres(double squareMeters)
        => squareMeters / 4046.86;
    
    public static double SquareMetersToHectares(double squareMeters)
        => squareMeters / 10000;
    
    public static double AcresToSquareMeters(double acres)
        => acres * 4046.86;
    
    // Distance conversions
    public static double MetersToFeet(double meters)
        => meters * 3.28084;
    
    public static double MetersToMiles(double meters)
        => meters / 1609.34;
    
    public static double MetersToKilometers(double meters)
        => meters / 1000;
    
    public static double FeetToMeters(double feet)
        => feet / 3.28084;
}
```

---

## Exceptions

All public methods throw appropriate exceptions on invalid input:

```csharp
namespace SteelTree.GeoAcre.Geometry
{
    /// <summary>
    /// Thrown when a polygon is invalid (e.g., <3 vertices).
    /// </summary>
    public class InvalidPolygonException : ArgumentException { }
    
    /// <summary>
    /// Thrown when coordinates are out of valid range.
    /// </summary>
    public class InvalidCoordinateException : ArgumentException { }
}
```

---

## Accuracy & Performance

| Operation | Accuracy | Time Complexity | Notes |
|-----------|----------|-----------------|-------|
| Distance | <0.5 m for typical distances | O(1) | Haversine formula |
| Area | <0.5% for sizes up to 1M m² | O(n) | Spherical excess |
| Perimeter | <0.5% | O(n) | Sum of distances |
| Intersections | Exact (topological) | O(n log n) | Sweep-line algorithm |
| Point-in-polygon | Exact | O(n) | Ray-casting |

---

## Testing Requirements

All public methods MUST have unit tests covering:

1. **Happy path**: Valid inputs produce correct results
2. **Edge cases**: Boundary conditions (poles, dateline, small polygons, etc.)
3. **Error cases**: Invalid inputs throw expected exceptions
4. **Accuracy**: Results verified against known reference data

**Test Style**: All tests MUST follow the Arrange/Act/Assert pattern:
- **Arrange**: Set up test data and any dependencies
- **Act**: Invoke the method being tested
- **Assert**: Verify the result or exception

**Mocking**: When tests require mocking, use the Moq library (NuGet: `Moq`).

### Reference Test Data

Use real surveyed areas or well-known geographic features:
- Central Park, New York (known area ≈ 843 acres)
- Small property in urban area (cross-validate with county records)
- Synthetic polygons with known areas (e.g., equilateral triangles at the equator)

### Example Unit Tests (MSTest with Arrange/Act/Assert)

```csharp
[TestClass]
public class GeoCalculationsTests
{
    [TestMethod]
    public void Distance_KnownCoordinates_ReturnsExpectedDistance()
    {
        // Arrange
        var from = new GeoPoint(40.7128, -74.0060); // NYC
        var to = new GeoPoint(34.0522, -118.2437);  // LA
        var expectedMeters = 3944000; // ~3944 km
        var tolerancePercent = 0.005; // 0.5%
        
        // Act
        var distance = GeoCalculations.Distance(from, to);
        
        // Assert
        var percentError = Math.Abs(distance - expectedMeters) / expectedMeters;
        Assert.IsTrue(percentError < tolerancePercent,
            $"Distance {distance} is not within {tolerancePercent * 100}% of expected {expectedMeters}");
    }
    
    [TestMethod]
    [ExpectedException(typeof(InvalidCoordinateException))]
    public void GeoPoint_InvalidLatitude_ThrowsException()
    {
        // Arrange & Act: Attempt to create with invalid latitude
        _ = new GeoPoint(91, 0);
        
        // Assert: Exception expected; handled by [ExpectedException]
    }
    
    [TestMethod]
    public void HasIntersections_SelfIntersectingPolygon_ReturnsTrue()
    {
        // Arrange
        var vertices = new List<GeoPoint>
        {
            new(40, -80),
            new(40, -85),
            new(45, -80),
            new(45, -85),
        };
        
        // Act
        var intersects = GeoCalculations.DetectIntersections(vertices);
        
        // Assert
        Assert.IsTrue(intersects, "Expected self-intersecting polygon to be detected");
    }
}
```

### Example Test with Moq (Mocking External Dependencies)

```csharp
[TestClass]
public class GeocodeServiceTests
{
    [TestMethod]
    public void GeocodeService_ValidAddress_CallsNominatimAndReturnsResult()
    {
        // Arrange
        var mockHttpClient = new Mock<HttpClient>();
        mockHttpClient
            .Setup(c => c.GetAsync(It.IsAny<string>()))
            .ReturnsAsync(new HttpResponseMessage(System.Net.HttpStatusCode.OK)
            {
                Content = new StringContent("{\"lat\": \"39.7817\", \"lon\": \"-89.6501\"}")
            });
        
        var service = new GeocodeService(mockHttpClient.Object);
        var query = "123 Main St, Springfield, IL";
        
        // Act
        var result = service.GeocodeAsync(query).Result;
        
        // Assert
        Assert.IsNotNull(result);
        Assert.AreEqual(39.7817, result.Latitude, 0.0001);
        Assert.AreEqual(-89.6501, result.Longitude, 0.0001);
        mockHttpClient.Verify(c => c.GetAsync(It.IsAny<string>()), Times.Once);
    }
}
```

---

## Versioning

This contract is version **1.0.0**. Future changes:

- **1.1.0**: Add support for LineString, MultiPolygon
- **2.0.0**: Integrate with PostGIS for server-side geometry (breaking change)

Semantic versioning is enforced; all changes are documented in CHANGELOG.md.
