namespace SteelTree.GeoAcre.Geometry.Tests;

[TestClass]
public class UnitConversionTests
{
    [TestMethod]
    [DataRow(1.0, 0.000247105)] // 1 sq m = 0.000247105 acres
    [DataRow(4046.8564224, 1.0)] // 1 acre = 4046.8564224 sq m
    public void SquareMetersToAcres_WithKnownValues_ReturnsCorrectConversion(double squareMeters, double expectedAcres)
    {
        // Act
        var acres = UnitConversion.SquareMetersToAcres(squareMeters);

        // Assert
        acres.Should().BeApproximately(expectedAcres, 0.00001);
    }

    [TestMethod]
    public void AcresToSquareMeters_AndBack_RecoverOriginal()
    {
        // Arrange
        double originalAcres = 10.5;
        double tolerance = originalAcres * 0.0001; // 0.01% tolerance

        // Act
        var squareMeters = UnitConversion.AcresToSquareMeters(originalAcres);
        var recoveredAcres = UnitConversion.SquareMetersToAcres(squareMeters);

        // Assert
        recoveredAcres.Should().BeApproximately(originalAcres, tolerance);
    }

    [TestMethod]
    [DataRow(1.0, 0.0001)] // 1 sq m = 0.0001 hectares
    [DataRow(10_000.0, 1.0)] // 10,000 sq m = 1 hectare
    public void SquareMetersToHectares_WithKnownValues_ReturnsCorrectConversion(double squareMeters, double expectedHectares)
    {
        // Act
        var hectares = UnitConversion.SquareMetersToHectares(squareMeters);

        // Assert
        hectares.Should().BeApproximately(expectedHectares, 0.0001);
    }

    [TestMethod]
    public void HectaresToSquareMeters_AndBack_RecoverOriginal()
    {
        // Arrange
        double originalHectares = 5.0;
        double tolerance = originalHectares * 0.0001;

        // Act
        var squareMeters = UnitConversion.HectaresToSquareMeters(originalHectares);
        var recoveredHectares = UnitConversion.SquareMetersToHectares(squareMeters);

        // Assert
        recoveredHectares.Should().BeApproximately(originalHectares, tolerance);
    }

    [TestMethod]
    [DataRow(1.0, 10.763910417)] // 1 sq m ≈ 10.76 sq ft
    [DataRow(0.09290304, 1.0)] // 1 sq ft = 0.0929 sq m
    public void SquareMetersToSquareFeet_WithKnownValues_ReturnsCorrectConversion(double squareMeters, double expectedSquareFeet)
    {
        // Act
        var squareFeet = UnitConversion.SquareMetersToSquareFeet(squareMeters);

        // Assert
        squareFeet.Should().BeApproximately(expectedSquareFeet, 0.01);
    }

    [TestMethod]
    [DataRow(1.0, 3.28084)] // 1 meter ≈ 3.28 feet
    [DataRow(0.3048, 1.0)] // 1 foot = 0.3048 meters
    public void MetersToFeet_WithKnownValues_ReturnsCorrectConversion(double meters, double expectedFeet)
    {
        // Act
        var feet = UnitConversion.MetersToFeet(meters);

        // Assert
        feet.Should().BeApproximately(expectedFeet, 0.01);
    }

    [TestMethod]
    public void FeetToMeters_AndBack_RecoverOriginal()
    {
        // Arrange
        double originalFeet = 100.0;
        double tolerance = originalFeet * 0.0001;

        // Act
        var meters = UnitConversion.FeetToMeters(originalFeet);
        var recoveredFeet = UnitConversion.MetersToFeet(meters);

        // Assert
        recoveredFeet.Should().BeApproximately(originalFeet, tolerance);
    }

    [TestMethod]
    [DataRow(1.0, 0.000621371)] // 1 meter ≈ 0.000621 miles
    [DataRow(1609.344, 1.0)] // 1 mile = 1609.344 meters
    public void MetersToMiles_WithKnownValues_ReturnsCorrectConversion(double meters, double expectedMiles)
    {
        // Act
        var miles = UnitConversion.MetersToMiles(meters);

        // Assert
        miles.Should().BeApproximately(expectedMiles, 0.000001);
    }

    [TestMethod]
    [DataRow(1.0, 0.001)] // 1 meter = 0.001 kilometers
    [DataRow(1000.0, 1.0)] // 1000 meters = 1 kilometer
    public void MetersToKilometers_WithKnownValues_ReturnsCorrectConversion(double meters, double expectedKilometers)
    {
        // Act
        var kilometers = UnitConversion.MetersToKilometers(meters);

        // Assert
        kilometers.Should().BeApproximately(expectedKilometers, 0.001);
    }

    [TestMethod]
    public void KilometersToMeters_AndBack_RecoverOriginal()
    {
        // Arrange
        double originalKilometers = 12.5;
        double tolerance = originalKilometers * 0.0001;

        // Act
        var meters = UnitConversion.KilometersToMeters(originalKilometers);
        var recoveredKilometers = UnitConversion.MetersToKilometers(meters);

        // Assert
        recoveredKilometers.Should().BeApproximately(originalKilometers, tolerance);
    }
}
