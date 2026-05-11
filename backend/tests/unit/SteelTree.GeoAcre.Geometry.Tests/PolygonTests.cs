using Microsoft.VisualStudio.TestTools.UnitTesting;
using FluentAssertions;
using SteelTree.GeoAcre.Geometry;
using System;
using System.Linq;
using System.Collections.Generic;

namespace SteelTree.GeoAcre.Geometry.Tests
{
    [TestClass]
    public class PolygonTests
    {
        /// <summary>
        /// Test: Polygon with 3 vertices is valid
        /// </summary>
        [TestMethod]
        public void Polygon_With3Vertices_IsValid()
        {
            // Arrange
            var vertices = new[]
            {
                new GeoPoint(0, 0),
                new GeoPoint(0, 1),
                new GeoPoint(1, 0)
            };

            // Act
            var polygon = new Polygon(Guid.NewGuid(), vertices, false, null);

            // Assert
            polygon.IsValid.Should().BeTrue();
            polygon.Vertices.Should().HaveCount(3);
        }

        /// <summary>
        /// Test: Polygon with fewer than 3 vertices is invalid
        /// </summary>
        [TestMethod]
        public void Polygon_WithFewerThan3Vertices_IsInvalid()
        {
            // Arrange
            var vertices = new[] { new GeoPoint(0, 0), new GeoPoint(1, 1) };

            // Act
            var polygon = new Polygon(Guid.NewGuid(), vertices, false, null);

            // Assert
            polygon.IsValid.Should().BeFalse();
        }

        /// <summary>
        /// Test: Polygon.ComputedAreaSquareMeters matches expected area for known polygon
        /// Using Central Park approximate boundary
        /// </summary>
        [TestMethod]
        public void Polygon_ComputedAreaSquareMeters_MatchesExpectedForKnownPolygon()
        {
            // Arrange - Central Park, New York (approximate boundary)
            var vertices = new[]
            {
                new GeoPoint(40.785091, -73.981155),
                new GeoPoint(40.784669, -73.951316),
                new GeoPoint(40.769921, -73.947555),
                new GeoPoint(40.768582, -73.981155)
            };

            var polygon = new Polygon(Guid.NewGuid(), vertices, false, null);

            // Expected area: Central Park is approximately 843 acres = ~3,410,370 sq meters
            // Our calculation should be within reasonable tolerance
            const double expectedAreaSquareMeters = 3410370; // approximate
            const double toleranceSquareMeters = 100000; // 100k sq meter tolerance

            // Act
            var area = polygon.ComputedAreaSquareMeters;

            // Assert
            area.Should().BeGreaterThan(expectedAreaSquareMeters - toleranceSquareMeters);
            area.Should().BeLessThan(expectedAreaSquareMeters + toleranceSquareMeters);
        }

        /// <summary>
        /// Test: Polygon.PerSideLengthsMeters has correct count and magnitudes
        /// </summary>
        [TestMethod]
        public void Polygon_PerSideLengthsMeters_HasCorrectCountAndMagnitudes()
        {
            // Arrange - Simple triangle at equator
            var vertices = new[]
            {
                new GeoPoint(0, 0),
                new GeoPoint(0, 1),
                new GeoPoint(1, 0)
            };

            var polygon = new Polygon(Guid.NewGuid(), vertices, false, null);

            // Act
            var sideLengths = polygon.PerSideLengthsMeters;

            // Assert
            sideLengths.Should().HaveCount(3);
            sideLengths.Should().AllSatisfy(length => length.Should().BeGreaterThan(0));

            // All sides should be roughly 111 km at equator (1 degree latitude/longitude ≈ 111 km)
            sideLengths.Should().AllSatisfy(
                length => length.Should().BeGreaterThan(100000).And.BeLessThan(200000)
            );
        }

        /// <summary>
        /// Test: Polygon correctly reports when it has no intersections
        /// </summary>
        [TestMethod]
        public void Polygon_SimpleNonIntersecting_HasNoIntersections()
        {
            // Arrange
            var vertices = new[]
            {
                new GeoPoint(0, 0),
                new GeoPoint(0, 1),
                new GeoPoint(1, 1),
                new GeoPoint(1, 0)
            };

            var polygon = new Polygon(Guid.NewGuid(), vertices, false, null);

            // Act
            var hasIntersections = polygon.HasIntersections;

            // Assert
            hasIntersections.Should().BeFalse();
        }

        /// <summary>
        /// Test: Polygon correctly reports when it has self-intersections
        /// </summary>
        [TestMethod]
        public void Polygon_SelfIntersecting_DetectsIntersections()
        {
            // Arrange - Bowtie/figure-8 shape (self-intersecting)
            var vertices = new[]
            {
                new GeoPoint(0, 0),
                new GeoPoint(0, 2),
                new GeoPoint(2, 0),
                new GeoPoint(2, 2)
            };

            var polygon = new Polygon(Guid.NewGuid(), vertices, false, null);

            // Act
            var hasIntersections = polygon.HasIntersections;

            // Assert
            hasIntersections.Should().BeTrue();
        }

        /// <summary>
        /// Test: Polygon with exclude polygons tracks relationship
        /// </summary>
        [TestMethod]
        public void Polygon_AsExcludePolygon_TracksParentRelationship()
        {
            // Arrange
            var primaryId = Guid.NewGuid();
            var excludeVertices = new[]
            {
                new GeoPoint(0.2, 0.2),
                new GeoPoint(0.2, 0.3),
                new GeoPoint(0.3, 0.2)
            };

            // Act
            var excludePolygon = new Polygon(Guid.NewGuid(), excludeVertices, true, primaryId);

            // Assert
            excludePolygon.IsExcludePolygon.Should().BeTrue();
            excludePolygon.ParentPolygonId.Should().Be(primaryId);
        }

        /// <summary>
        /// Test: Polygon perimeter calculation
        /// </summary>
        [TestMethod]
        public void Polygon_ComputedPerimeterMeters_CalculatesCorrectly()
        {
            // Arrange - Square-ish polygon at equator
            var vertices = new[]
            {
                new GeoPoint(0, 0),
                new GeoPoint(0, 1),
                new GeoPoint(1, 1),
                new GeoPoint(1, 0)
            };

            var polygon = new Polygon(Guid.NewGuid(), vertices, false, null);

            // At equator, 1 degree ≈ 111 km
            // Square with 1-degree sides should have perimeter ≈ 4 * 111 km
            const double expectedPerimeterMeters = 4 * 111000; // 444 km
            const double tolerance = 20000; // 20 km tolerance

            // Act
            var perimeter = polygon.ComputedPerimeterMeters;

            // Assert
            perimeter.Should().BeGreaterThan(expectedPerimeterMeters - tolerance);
            perimeter.Should().BeLessThan(expectedPerimeterMeters + tolerance);
        }
    }
}
