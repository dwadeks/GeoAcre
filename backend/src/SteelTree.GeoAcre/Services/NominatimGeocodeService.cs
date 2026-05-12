using Microsoft.Extensions.Logging;

namespace SteelTree.GeoAcre.Services;

public sealed class NominatimGeocodeService : IGeocodeService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<NominatimGeocodeService> _logger;
    private const string NominatimBaseUrl = "https://nominatim.openstreetmap.org";
    private static DateTime _lastRequestTime = DateTime.MinValue;
    private static readonly SemaphoreSlim RateLimitLock = new(1, 1);
    private const int MinRequestIntervalMs = 1000;

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
        {
            throw new ArgumentException("Query cannot be empty", nameof(query));
        }

        try
        {
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
                new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? [];

            return results.Select((result, index) => new GeocodeResult
            {
                Id = $"{index}",
                DisplayName = result.DisplayName ?? string.Empty,
                Latitude = double.Parse(result.Lat ?? "0"),
                Longitude = double.Parse(result.Lon ?? "0"),
                BoundingBox = result.BoundingBox?.Select(double.Parse).ToArray(),
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
        {
            throw new ArgumentException("Latitude or longitude is out of valid range.");
        }

        try
        {
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
                new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            return result?.DisplayName ?? $"{latitude}, {longitude}";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reverse geocoding location");
            throw;
        }
    }

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

    private sealed class NominatimSearchResult
    {
        public string? DisplayName { get; set; }

        public string? Lat { get; set; }

        public string? Lon { get; set; }

        public string[]? BoundingBox { get; set; }
    }

    private sealed class NominatimReverseResult
    {
        public string? DisplayName { get; set; }
    }
}
