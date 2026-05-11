using FluentAssertions;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using SteelTree.GeoAcre.Geometry;

namespace SteelTree.GeoAcre.Geometry.Tests;

[TestClass]
public class GeoCalculations_ExcludeTests
{
    [TestMethod]
    public void NetArea_WithSingleExclude_EqualsPrimaryMinusExcludeOverlap()
    {
        // Arrange
        var primary = CreatePolygon((0, 0), (0, 2), (2, 2), (2, 0));
        var exclude = CreatePolygon((0.5, 0.5), (0.5, 1.0), (1.0, 1.0), (1.0, 0.5));

        // Act
        var netArea = ComputeNetArea(primary, new[] { exclude });
        var primaryArea = primary.ComputedAreaSquareMeters;
        var overlapArea = GeoCalculations.ComputeArea(GeoCalculations.ComputeIntersection(primary, exclude));

        // Assert
        netArea.Should().BeApproximately(primaryArea - overlapArea, 1.0);
        netArea.Should().BeGreaterThan(0);
    }

    [TestMethod]
    public void NetArea_WithMultipleExcludes_EqualsPrimaryMinusSumOfOverlaps()
    {
        // Arrange
        var primary = CreatePolygon((0, 0), (0, 3), (3, 3), (3, 0));
        var exclude1 = CreatePolygon((0.5, 0.5), (0.5, 1.0), (1.0, 1.0), (1.0, 0.5));
        var exclude2 = CreatePolygon((2.0, 2.0), (2.0, 2.5), (2.5, 2.5), (2.5, 2.0));

        // Act
        var netArea = ComputeNetArea(primary, new[] { exclude1, exclude2 });

        var overlap1 = GeoCalculations.ComputeArea(GeoCalculations.ComputeIntersection(primary, exclude1));
        var overlap2 = GeoCalculations.ComputeArea(GeoCalculations.ComputeIntersection(primary, exclude2));
        var expected = primary.ComputedAreaSquareMeters - overlap1 - overlap2;

        // Assert
        netArea.Should().BeApproximately(expected, 1.0);
        netArea.Should().BeGreaterThan(0);
    }

    [TestMethod]
    public void NetArea_WithExcludeLargerThanPrimary_IsClampedToZeroOrAbove()
    {
        // Arrange
        var primary = CreatePolygon((0, 0), (0, 1), (1, 1), (1, 0));
        var largeExclude = CreatePolygon((-1, -1), (-1, 2), (2, 2), (2, -1));

        // Act
        var netArea = ComputeNetArea(primary, new[] { largeExclude });

        // Assert
        netArea.Should().BeGreaterThanOrEqualTo(0);
        netArea.Should().BeApproximately(0, 1.0);
    }

    [TestMethod]
    public void NetArea_WithPartiallyOutsideExclude_SubtractsOnlyIntersectionArea()
    {
        // Arrange
        var primary = CreatePolygon((0, 0), (0, 2), (2, 2), (2, 0));
        var partiallyOutside = CreatePolygon((1.5, 1.5), (1.5, 2.5), (2.5, 2.5), (2.5, 1.5));

        // Act
        var overlapVertices = GeoCalculations.ComputeIntersection(primary, partiallyOutside);
        var overlapArea = overlapVertices.Count >= 3
            ? GeoCalculations.ComputeArea(overlapVertices)
            : 0;
        var excludeArea = partiallyOutside.ComputedAreaSquareMeters;
        var netArea = ComputeNetArea(primary, new[] { partiallyOutside });

        // Assert
        overlapArea.Should().BeGreaterThan(0);
        overlapArea.Should().BeLessThan(excludeArea);
        netArea.Should().BeApproximately(primary.ComputedAreaSquareMeters - overlapArea, 1.0);
    }

    private static Polygon CreatePolygon(params (double lat, double lon)[] points)
    {
        return new Polygon(points.Select(p => new GeoPoint(p.lat, p.lon)).ToList());
    }

    private static double ComputeNetArea(Polygon primary, IEnumerable<Polygon> excludes)
    {
        var excludedArea = 0d;

        foreach (var exclude in excludes)
        {
            var overlap = GeoCalculations.ComputeIntersection(primary, exclude);
            if (overlap.Count >= 3)
            {
                excludedArea += GeoCalculations.ComputeArea(overlap);
            }
        }

        return Math.Max(0, primary.ComputedAreaSquareMeters - excludedArea);
    }
}
