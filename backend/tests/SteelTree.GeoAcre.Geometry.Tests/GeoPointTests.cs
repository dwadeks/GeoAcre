namespace SteelTree.GeoAcre.Geometry.Tests;

[TestClass]
public class GeoPointTests
{
    [TestMethod]
    public void GeoPoint_WithValidCoordinates_CreatesSuccessfully()
    {
        // Arrange
        double latitude = 40.7128;
        double longitude = -74.0060;

        // Act
        var point = new GeoPoint(latitude, longitude);

        // Assert
        point.Latitude.Should().Be(latitude);
        point.Longitude.Should().Be(longitude);
    }

    [TestMethod]
    [DataRow(91.0, 0.0)] // Latitude too high
    [DataRow(-91.0, 0.0)] // Latitude too low
    public void GeoPoint_WithInvalidLatitude_ThrowsInvalidCoordinateException(double latitude, double longitude)
    {
        // Act & Assert
        FluentActions.Invoking(() => new GeoPoint(latitude, longitude))
            .Should().Throw<InvalidCoordinateException>();
    }

    [TestMethod]
    [DataRow(0.0, 181.0)] // Longitude too high
    [DataRow(0.0, -181.0)] // Longitude too low
    public void GeoPoint_WithInvalidLongitude_ThrowsInvalidCoordinateException(double latitude, double longitude)
    {
        // Act & Assert
        FluentActions.Invoking(() => new GeoPoint(latitude, longitude))
            .Should().Throw<InvalidCoordinateException>();
    }

    [TestMethod]
    public void GeoPoint_BoundaryValues_AreValid()
    {
        // Arrange & Act & Assert
        var north = new GeoPoint(90.0, 0.0);
        var south = new GeoPoint(-90.0, 0.0);
        var east = new GeoPoint(0.0, 180.0);
        var west = new GeoPoint(0.0, -180.0);

        north.Latitude.Should().Be(90.0);
        south.Latitude.Should().Be(-90.0);
        east.Longitude.Should().Be(180.0);
        west.Longitude.Should().Be(-180.0);
    }

    [TestMethod]
    public void GeoPoint_EqualityCheck_WorksCorrectly()
    {
        // Arrange
        var point1 = new GeoPoint(40.7128, -74.0060);
        var point2 = new GeoPoint(40.7128, -74.0060);
        var point3 = new GeoPoint(51.5074, -0.1278); // London

        // Act & Assert
        point1.Should().Be(point2);
        point1.Should().NotBe(point3);
    }
}
