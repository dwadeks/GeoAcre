namespace SteelTree.GeoAcre.Web.Api.Models;

/// <summary>
/// Response DTO for polyline distance calculation.
/// </summary>
public class CalculateDistanceResponse
{
    public required double TotalDistanceMeters { get; set; }

    public required double[] PerSegmentDistancesMeters { get; set; }
}
