namespace SteelTree.GeoAcre.Web.Api.Models;

/// <summary>
/// Request DTO for geometry area calculation.
/// </summary>
public class CalculateAreaRequest
{
    public required LatLngDto[] Vertices { get; set; }

    public LatLngDto[][]? ExcludePolygons { get; set; }
}

