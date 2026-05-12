namespace SteelTree.GeoAcre.Web.Api.Models;

/// <summary>
/// Response DTO for geocoding search result.
/// </summary>
public class GeocodeSearchResponse
{
    public required GeocodeResult[] Results { get; set; }
}
