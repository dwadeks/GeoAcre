using SteelTree.GeoAcre.Web.Api.Models;

namespace SteelTree.GeoAcre.Web.Api.Services;

/// <summary>
/// Interface for geocoding services (address search and reverse geocoding).
/// </summary>
public interface IGeocodeService
{
    /// <summary>
    /// Searches for a location by query string (address or place name).
    /// </summary>
    /// <param name="query">Search query</param>
    /// <param name="maxResults">Maximum number of results to return</param>
    /// <returns>List of geocoding results</returns>
    Task<IEnumerable<GeocodeResult>> SearchAsync(string query, int maxResults = 10);

    /// <summary>
    /// Performs reverse geocoding to find an address for given coordinates.
    /// </summary>
    /// <param name="latitude">Latitude of the location</param>
    /// <param name="longitude">Longitude of the location</param>
    /// <returns>Address string for the location</returns>
    Task<string> ReverseGeocodeAsync(double latitude, double longitude);
}

/// <summary>
/// Geocoding service implementation using Nominatim (OpenStreetMap).
/// </summary>
public class NominatimGeocodeService : IGeocodeService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<NominatimGeocodeService> _logger;
    private const string NominatimBaseUrl = "https://nominatim.openstreetmap.org";
    private static DateTime _lastRequestTime = DateTime.MinValue;
    private static readonly SemaphoreSlim RateLimitLock = new(1, 1);
    private const int MinRequestIntervalMs = 1000; // 1 second between requests per Nominatim Terms of Service

    public NominatimGeocodeService(HttpClient httpClient, ILogger<NominatimGeocodeService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _httpClient.Timeout = TimeSpan.FromSeconds(10);
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "GeoAcre/1.0");
    }

    public async Task<IEnumerable<GeocodeResult>> SearchAsync(string query, int maxResults = 10)
    {
        if (string.IsNullOrWhiteSpace(query))
            throw new ArgumentException("Query cannot be empty", nameof(query));

        try
        {
            // Rate limiting to comply with Nominatim ToS
            await RateLimitAsync();

            var url = $"{NominatimBaseUrl}/search?q={Uri.EscapeDataString(query)}&format=json&limit={maxResults}";
            var response = await _httpClient.GetAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Nominatim search failed with status {StatusCode}", response.StatusCode);
                throw new HttpRequestException($"Nominatim API returned {response.StatusCode}");
            }

            var content = await response.Content.ReadAsStringAsync();
            var results = System.Text.Json.JsonSerializer.Deserialize<List<NominatimSearchResult>>(
                content, 
                new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            ) ?? [];

            return results.Select((r, index) => new GeocodeResult
            {
                Id = $"{index}",
                DisplayName = r.DisplayName ?? "",
                Latitude = double.Parse(r.Lat ?? "0"),
                Longitude = double.Parse(r.Lon ?? "0"),
                BoundingBox = r.BoundingBox?.Select(double.Parse).ToArray()
            }).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching geocoding service");
            throw;
        }
    }

    public async Task<string> ReverseGeocodeAsync(double latitude, double longitude)
    {
        if (latitude is < -90 or > 90 || longitude is < -180 or > 180)
            throw new ArgumentException("Latitude or longitude is out of valid range.");

        try
        {
            // Rate limiting
            await RateLimitAsync();

            var url = $"{NominatimBaseUrl}/reverse?lat={latitude}&lon={longitude}&format=json";
            var response = await _httpClient.GetAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Nominatim reverse geocoding failed with status {StatusCode}", response.StatusCode);
                throw new HttpRequestException($"Nominatim API returned {response.StatusCode}");
            }

            var content = await response.Content.ReadAsStringAsync();
            var result = System.Text.Json.JsonSerializer.Deserialize<NominatimReverseResult>(
                content,
                new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            );

            return result?.DisplayName ?? $"{latitude}, {longitude}";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reverse geocoding location");
            throw;
        }
    }

    /// <summary>
    /// Rate limiting helper to comply with Nominatim Terms of Service (max 1 request/sec).
    /// </summary>
    private static Task RateLimitAsync()
    {
        return RateLimitInternalAsync();
    }

    private static async Task RateLimitInternalAsync()
    {
        await RateLimitLock.WaitAsync();
        try
        {
            var elapsedMs = (DateTime.UtcNow - _lastRequestTime).TotalMilliseconds;
            if (elapsedMs < MinRequestIntervalMs)
            {
                await Task.Delay(MinRequestIntervalMs - (int)elapsedMs);
            }

            _lastRequestTime = DateTime.UtcNow;
        }
        finally
        {
            RateLimitLock.Release();
        }
    }

    // DTOs for Nominatim API responses
    private class NominatimSearchResult
    {
        public string? DisplayName { get; set; }
        public string? Lat { get; set; }
        public string? Lon { get; set; }
        public string[]? BoundingBox { get; set; }
    }

    private class NominatimReverseResult
    {
        public string? DisplayName { get; set; }
    }
}
