namespace SteelTree.GeoAcre.Web.Api.Models;

/// <summary>
/// Request DTO for polyline distance calculation.
/// </summary>
public class CalculateDistanceRequest
{
    public required LatLngDto[] Vertices { get; set; }
}
