namespace SteelTree.GeoAcre.Services;

public interface IGeocodeService
{
    Task<IEnumerable<GeocodeResult>> SearchAsync(string query, int maxResults = 10);

    Task<string> ReverseGeocodeAsync(double latitude, double longitude);
}
