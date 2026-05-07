namespace SteelTree.GeoAcre.Geometry.Tests;

[TestClass]
public class GeoCalculations_IntersectionTests
{
    [TestMethod]
    public void DetectIntersections_SimpleSquare_ReturnsFalse()
    {
        // Arrange - Non-intersecting square
        var vertices = new[]
        {
            new GeoPoint(0.0, 0.0),
            new GeoPoint(0.01, 0.0),
            new GeoPoint(0.01, 0.01),
            new GeoPoint(0.0, 0.01),
        };

        // Act
        var hasIntersections = GeoCalculations.DetectIntersections(vertices);

        // Assert
        hasIntersections.Should().BeFalse();
    }

    [TestMethod]
    public void DetectIntersections_BowtiePattern_ReturnsTrue()
    {
        // Arrange - Bowtie polygon (self-intersecting)
        var vertices = new[]
        {
            new GeoPoint(0.0, 0.0),    // Bottom left
            new GeoPoint(0.01, 0.01),  // Top right (crossing)
            new GeoPoint(0.01, 0.0),   // Bottom right
            new GeoPoint(0.0, 0.01),   // Top left (crossing)
        };

        // Act
        var hasIntersections = GeoCalculations.DetectIntersections(vertices);

        // Assert
        hasIntersections.Should().BeTrue();
    }

    [TestMethod]
    public void DetectIntersections_Triangle_ReturnsFalse()
    {
        // Arrange - Simple triangle (non-intersecting)
        var vertices = new[]
        {
            new GeoPoint(0.0, 0.0),
            new GeoPoint(0.01, 0.0),
            new GeoPoint(0.005, 0.01),
        };

        // Act
        var hasIntersections = GeoCalculations.DetectIntersections(vertices);

        // Assert
        hasIntersections.Should().BeFalse();
    }

    [TestMethod]
    public void DetectIntersections_SelfIntersectingFigureEight_ReturnsTrue()
    {
        // Arrange - Figure-eight pattern (self-intersecting)
        var vertices = new[]
        {
            new GeoPoint(0.0, 0.005),   // Left middle
            new GeoPoint(0.01, 0.01),   // Top right
            new GeoPoint(0.01, 0.0),    // Bottom right (crossing path)
            new GeoPoint(0.0, 0.005),   // Back to center
        };

        // Act
        var hasIntersections = GeoCalculations.DetectIntersections(vertices);

        // Assert
        hasIntersections.Should().BeTrue();
    }

    [TestMethod]
    public void DetectIntersections_EmptyOrTinyPolygon_ReturnsFalse()
    {
        // Arrange
        var emptyVertices = Array.Empty<GeoPoint>();
        var singlePoint = new[] { new GeoPoint(0.0, 0.0) };

        // Act
        var hasIntersectionsEmpty = GeoCalculations.DetectIntersections(emptyVertices);
        var hasIntersectionsSingle = GeoCalculations.DetectIntersections(singlePoint);

        // Assert
        hasIntersectionsEmpty.Should().BeFalse();
        hasIntersectionsSingle.Should().BeFalse();
    }

    [TestMethod]
    public void IsPointInPolygon_PointInside_ReturnsTrue()
    {
        // Arrange - Square
        var square = new[]
        {
            new GeoPoint(0.0, 0.0),
            new GeoPoint(0.01, 0.0),
            new GeoPoint(0.01, 0.01),
            new GeoPoint(0.0, 0.01),
        };
        var pointInside = new GeoPoint(0.005, 0.005);

        // Act
        var isInside = GeoCalculations.IsPointInPolygon(pointInside, square);

        // Assert
        isInside.Should().BeTrue();
    }

    [TestMethod]
    public void IsPointInPolygon_PointOutside_ReturnsFalse()
    {
        // Arrange - Square
        var square = new[]
        {
            new GeoPoint(0.0, 0.0),
            new GeoPoint(0.01, 0.0),
            new GeoPoint(0.01, 0.01),
            new GeoPoint(0.0, 0.01),
        };
        var pointOutside = new GeoPoint(-0.005, -0.005);

        // Act
        var isInside = GeoCalculations.IsPointInPolygon(pointOutside, square);

        // Assert
        isInside.Should().BeFalse();
    }

    [TestMethod]
    public void IsPointInPolygon_PointOnBoundary_ReturnsTrue()
    {
        // Arrange - Square
        var square = new[]
        {
            new GeoPoint(0.0, 0.0),
            new GeoPoint(0.01, 0.0),
            new GeoPoint(0.01, 0.01),
            new GeoPoint(0.0, 0.01),
        };
        var pointOnBoundary = new GeoPoint(0.005, 0.0); // On bottom edge

        // Act
        var isInside = GeoCalculations.IsPointInPolygon(pointOnBoundary, square);

        // Assert - Boundary behavior may vary; typically true for "inside or on boundary"
        isInside.Should().BeTrue();
    }
}
