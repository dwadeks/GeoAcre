namespace SteelTree.GeoAcre.Services;

public sealed class GeocodeResult
{
    public string Id { get; set; } = string.Empty;

    public string DisplayName { get; set; } = string.Empty;

    public double Latitude { get; set; }

    public double Longitude { get; set; }

    public double[]? BoundingBox { get; set; }
}
