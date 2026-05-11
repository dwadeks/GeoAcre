namespace SteelTree.GeoAcre.Geometry.Tests;

[TestClass]
public class GeoCalculations_AreaTests
{
    [TestMethod]
    public void ComputeArea_SimpleTriangle_CalculatesCorrectly()
    {
        // Arrange - Simple triangle at equator (easier to verify)
        var vertices = new[]
        {
            new GeoPoint(0.0, 0.0),
            new GeoPoint(0.01, 0.0),  // ~1.11 km east
            new GeoPoint(0.0, 0.01),  // ~1.11 km north
        };
        // Approximate area: 0.5 * base * height ≈ 0.5 * 1.11 * 1.11 ≈ 0.62 sq km ≈ 620,000 sq m
        var expectedAreaSquareMeters = 620_000;
        var tolerancePercent = 0.15; // 15% tolerance due to spherical geometry

        // Act
        var areaSquareMeters = GeoCalculations.ComputeArea(vertices);

        // Assert
        areaSquareMeters.Should().BeApproximately(expectedAreaSquareMeters, expectedAreaSquareMeters * tolerancePercent);
    }

    [TestMethod]
    public void ComputeArea_CentralPark_WithinAccuracyTarget()
    {
        // Arrange - Central Park, NYC (approximately 843 acres = 3,409,000 square meters)
        // Note: These are approximate coordinates; the actual spherical polygon formed
        // by these coordinates has an area of approximately 2.76M sq m due to spherical geometry
        var vertices = new[]
        {
            new GeoPoint(40.7829, -73.9654), // Northwest corner
            new GeoPoint(40.7829, -73.9456), // Northeast corner
            new GeoPoint(40.7680, -73.9456), // Southeast corner
            new GeoPoint(40.7680, -73.9654), // Southwest corner
        };
        var expectedSquareMeters = 2_762_334; // Actual area from spherical polygon formula with these coordinates
        var tolerancePercent = 0.01; // 1% tolerance for spherical geometry approximation

        // Act
        var areaSquareMeters = GeoCalculations.ComputeArea(vertices);

        // Assert
        areaSquareMeters.Should().BeApproximately(expectedSquareMeters, expectedSquareMeters * tolerancePercent);
    }

    [TestMethod]
    public void ComputeArea_EmptyOrInvalidPolygon_ReturnsZero()
    {
        // Arrange
        var emptyVertices = Array.Empty<GeoPoint>();
        var twoVertices = new[] { new GeoPoint(0.0, 0.0), new GeoPoint(1.0, 1.0) };

        // Act
        var areaFromEmpty = GeoCalculations.ComputeArea(emptyVertices);
        var areaFromTwo = GeoCalculations.ComputeArea(twoVertices);

        // Assert
        areaFromEmpty.Should().Be(0);
        areaFromTwo.Should().Be(0);
    }

    [TestMethod]
    public void ComputeAreaEvenOddRule_SelfIntersectingPolygon_CalculatesCorrectly()
    {
        // Arrange - Bowtie polygon (two triangles intersecting at center)
        var vertices = new[]
        {
            new GeoPoint(0.0, 0.0),    // Bottom left
            new GeoPoint(0.01, 0.01),  // Top right (crossing)
            new GeoPoint(0.01, 0.0),   // Bottom right
            new GeoPoint(0.0, 0.01),   // Top left (crossing)
        };

        // Act - Should use even-odd rule
        var area = GeoCalculations.ComputeAreaEvenOddRule(vertices);

        // Assert - Area should be positive and non-zero
        area.Should().BeGreaterThan(0);
    }

    [TestMethod]
    public void ComputePerimeter_SimpleSquare_CalculatesCorrectly()
    {
        // Arrange - Square at equator (0.01 degree = ~1.11 km per side)
        var vertices = new[]
        {
            new GeoPoint(0.0, 0.0),
            new GeoPoint(0.01, 0.0),
            new GeoPoint(0.01, 0.01),
            new GeoPoint(0.0, 0.01),
        };
        var expectedPerimeterKm = 4 * 1.11; // Approximate
        var expectedPerimeterMeters = expectedPerimeterKm * 1000;
        var tolerancePercent = 0.15;

        // Act
        var perimeterMeters = GeoCalculations.ComputePerimeter(vertices);

        // Assert
        perimeterMeters.Should().BeApproximately(expectedPerimeterMeters, expectedPerimeterMeters * tolerancePercent);
    }
}
