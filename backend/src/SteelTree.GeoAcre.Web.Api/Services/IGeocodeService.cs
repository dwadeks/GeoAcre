using SteelTree.GeoAcre.Web.Api.Models;

namespace SteelTree.GeoAcre.Web.Api.Services;

/// <summary>
/// Interface for geocoding services (address search and reverse geocoding).
/// </summary>
public interface IGeocodeService
{
    Task<IEnumerable<GeocodeResult>> SearchAsync(string query, int maxResults = 10);

    Task<string> ReverseGeocodeAsync(double latitude, double longitude);
}
