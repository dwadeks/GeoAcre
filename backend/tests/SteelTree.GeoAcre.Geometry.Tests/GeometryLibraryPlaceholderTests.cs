namespace SteelTree.GeoAcre.Geometry.Tests;

[TestClass]
public class GeometryLibraryPlaceholderTests
{
    [TestMethod]
    public void GeometryLibraryPlaceholder_Version_ShouldBe_1_0_0()
    {
        // Arrange
        var expectedVersion = "1.0.0";

        // Act
        var actualVersion = GeometryLibraryPlaceholder.Version;

        // Assert
        actualVersion.Should().Be(expectedVersion);
    }
}
