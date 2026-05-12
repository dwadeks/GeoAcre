namespace SteelTree.GeoAcre.Web.Api.Models;

/// <summary>
/// Request DTO for reverse geocoding.
/// </summary>
public class ReverseGeocodeRequest
{
    public required double Latitude { get; set; }

    public required double Longitude { get; set; }
}
