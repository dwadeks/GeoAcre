namespace SteelTree.GeoAcre.Web.Api.Models;

/// <summary>
/// Response DTO for reverse geocoding.
/// </summary>
public class ReverseGeocodeResponse
{
    public required string Address { get; set; }

    public required double Latitude { get; set; }

    public required double Longitude { get; set; }
}
