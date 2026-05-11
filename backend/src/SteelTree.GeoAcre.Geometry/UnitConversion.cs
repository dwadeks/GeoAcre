namespace SteelTree.GeoAcre.Geometry;

/// <summary>
/// Static class for converting between different units of measurement.
/// </summary>
public static class UnitConversion
{
    // Area conversions
    private const double SquareMetersPerAcre = 4046.8564224;
    private const double SquareMetersPerHectare = 10_000;
    private const double SquareMetersPerSquareFoot = 0.09290304;
    private const double SquareMetersPerSquareMile = 2_589_988.110336;

    // Distance conversions
    private const double MetersPerFoot = 0.3048;
    private const double MetersPerMile = 1609.344;
    private const double MetersPerKilometer = 1000;

    // ===== AREA CONVERSIONS =====

    /// <summary>
    /// Converts square meters to acres.
    /// </summary>
    public static double SquareMetersToAcres(double squareMeters)
    {
        return squareMeters / SquareMetersPerAcre;
    }

    /// <summary>
    /// Converts acres to square meters.
    /// </summary>
    public static double AcresToSquareMeters(double acres)
    {
        return acres * SquareMetersPerAcre;
    }

    /// <summary>
    /// Converts square meters to hectares.
    /// </summary>
    public static double SquareMetersToHectares(double squareMeters)
    {
        return squareMeters / SquareMetersPerHectare;
    }

    /// <summary>
    /// Converts hectares to square meters.
    /// </summary>
    public static double HectaresToSquareMeters(double hectares)
    {
        return hectares * SquareMetersPerHectare;
    }

    /// <summary>
    /// Converts square meters to square feet.
    /// </summary>
    public static double SquareMetersToSquareFeet(double squareMeters)
    {
        return squareMeters / SquareMetersPerSquareFoot;
    }

    /// <summary>
    /// Converts square feet to square meters.
    /// </summary>
    public static double SquareFeetToSquareMeters(double squareFeet)
    {
        return squareFeet * SquareMetersPerSquareFoot;
    }

    /// <summary>
    /// Converts square meters to square miles.
    /// </summary>
    public static double SquareMetersToSquareMiles(double squareMeters)
    {
        return squareMeters / SquareMetersPerSquareMile;
    }

    /// <summary>
    /// Converts square miles to square meters.
    /// </summary>
    public static double SquareMilesToSquareMeters(double squareMiles)
    {
        return squareMiles * SquareMetersPerSquareMile;
    }

    // ===== DISTANCE CONVERSIONS =====

    /// <summary>
    /// Converts meters to feet.
    /// </summary>
    public static double MetersToFeet(double meters)
    {
        return meters / MetersPerFoot;
    }

    /// <summary>
    /// Converts feet to meters.
    /// </summary>
    public static double FeetToMeters(double feet)
    {
        return feet * MetersPerFoot;
    }

    /// <summary>
    /// Converts meters to miles.
    /// </summary>
    public static double MetersToMiles(double meters)
    {
        return meters / MetersPerMile;
    }

    /// <summary>
    /// Converts miles to meters.
    /// </summary>
    public static double MilesToMeters(double miles)
    {
        return miles * MetersPerMile;
    }

    /// <summary>
    /// Converts meters to kilometers.
    /// </summary>
    public static double MetersToKilometers(double meters)
    {
        return meters / MetersPerKilometer;
    }

    /// <summary>
    /// Converts kilometers to meters.
    /// </summary>
    public static double KilometersToMeters(double kilometers)
    {
        return kilometers * MetersPerKilometer;
    }
}
