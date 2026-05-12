namespace SteelTree.GeoAcre.Web.Api.Models;

/// <summary>
/// Response DTO for geometry area calculation.
/// </summary>
public class CalculateAreaResponse
{
    public required double AreaSquareMeters { get; set; }

    public double NetAreaSquareMeters { get; set; }

    public double ExcludedAreaSquareMeters { get; set; }

    public required double[] PerSideLengthsMeters { get; set; }

    public required bool HasIntersections { get; set; }
}
