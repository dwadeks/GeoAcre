namespace SteelTree.GeoAcre.Web.Api.Models;

/// <summary>
/// Latitude/Longitude coordinate pair.
/// </summary>
public class LatLngDto
{
    public required double Latitude { get; set; }

    public required double Longitude { get; set; }
}
