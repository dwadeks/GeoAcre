namespace SteelTree.GeoAcre.Web.Api.Models;

/// <summary>
/// Request DTO for geocoding search.
/// </summary>
public class GeocodeSearchRequest
{
    public required string Query { get; set; }

    public int MaxResults { get; set; } = 10;
}
