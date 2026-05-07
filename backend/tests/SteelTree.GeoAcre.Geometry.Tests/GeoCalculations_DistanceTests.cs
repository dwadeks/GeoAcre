namespace SteelTree.GeoAcre.Geometry.Tests;

[TestClass]
public class GeoCalculations_DistanceTests
{
    [TestMethod]
    public void Distance_SamePoint_ReturnsZero()
    {
        // Arrange
        var nyc = new GeoPoint(40.7128, -74.0060);

        // Act
        var distance = GeoCalculations.Distance(nyc, nyc);

        // Assert
        distance.Should().BeApproximately(0, 0.1);
    }

    [TestMethod]
    public void Distance_NYCToLA_IsWithin0_5PercentAccuracy()
    {
        // Arrange
        var nyc = new GeoPoint(40.7128, -74.0060);
        var la = new GeoPoint(34.0522, -118.2437);
        var expectedDistanceKm = 3944; // Approximate great-circle distance
        var toleranceKm = expectedDistanceKm * 0.005; // 0.5% tolerance

        // Act
        var distanceMeters = GeoCalculations.Distance(nyc, la);
        var distanceKm = distanceMeters / 1000;

        // Assert
        distanceKm.Should().BeApproximately(expectedDistanceKm, toleranceKm);
    }

    [TestMethod]
    public void Distance_IsSymmetric()
    {
        // Arrange
        var pointA = new GeoPoint(40.7128, -74.0060); // NYC
        var pointB = new GeoPoint(51.5074, -0.1278); // London

        // Act
        var distanceAB = GeoCalculations.Distance(pointA, pointB);
        var distanceBA = GeoCalculations.Distance(pointB, pointA);

        // Assert
        distanceAB.Should().BeApproximately(distanceBA, 0.1);
    }

    [TestMethod]
    public void Distance_AtEquator_IsAccurate()
    {
        // Arrange
        var point1 = new GeoPoint(0.0, 0.0);
        var point2 = new GeoPoint(0.0, 1.0); // 1 degree longitude at equator ≈ 111.32 km
        var expectedDistanceKm = 111.32;
        var toleranceKm = expectedDistanceKm * 0.01; // 1% tolerance

        // Act
        var distanceMeters = GeoCalculations.Distance(point1, point2);
        var distanceKm = distanceMeters / 1000;

        // Assert
        distanceKm.Should().BeApproximately(expectedDistanceKm, toleranceKm);
    }

    [TestMethod]
    public void Distance_AtPoles_IsCalculable()
    {
        // Arrange
        var northPole = new GeoPoint(90.0, 0.0);
        var equator = new GeoPoint(0.0, 0.0);
        var expectedDistanceKm = 10_007.543; // Quarter Earth circumference

        // Act
        var distanceMeters = GeoCalculations.Distance(northPole, equator);
        var distanceKm = distanceMeters / 1000;

        // Assert
        distanceKm.Should().BeApproximately(expectedDistanceKm, expectedDistanceKm * 0.01); // 1% tolerance
    }
}
