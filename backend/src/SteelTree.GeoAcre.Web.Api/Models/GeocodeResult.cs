namespace SteelTree.GeoAcre.Web.Api.Models;

/// <summary>
/// Individual geocoding result.
/// </summary>
public class GeocodeResult
{
    public required string Id { get; set; }

    public required string DisplayName { get; set; }

    public required double Latitude { get; set; }

    public required double Longitude { get; set; }

    public double[]? BoundingBox { get; set; }
}
