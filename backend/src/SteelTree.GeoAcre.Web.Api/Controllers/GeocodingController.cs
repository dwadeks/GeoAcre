using Microsoft.AspNetCore.Mvc;
using SteelTree.GeoAcre.Services;
using SteelTree.GeoAcre.Web.Api.Models;
using ApiGeocodeResult = SteelTree.GeoAcre.Web.Api.Models.GeocodeResult;

namespace SteelTree.GeoAcre.Web.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GeocodingController : ControllerBase
{
    private readonly IGeocodeService _geocodeService;
    private readonly ILogger<GeocodingController> _logger;

    public GeocodingController(IGeocodeService geocodeService, ILogger<GeocodingController> logger)
    {
        _geocodeService = geocodeService;
        _logger = logger;
    }

    [HttpPost("search")]
    public async Task<ActionResult<GeocodeSearchResponse>> Search([FromBody] GeocodeSearchRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Query))
        {
            return BadRequest("Query cannot be empty.");
        }

        try
        {
            var results = await _geocodeService.SearchAsync(request.Query, request.MaxResults);
            return Ok(new GeocodeSearchResponse
            {
                Results =
                [
                    .. results.Select(result => new ApiGeocodeResult
                    {
                        Id = result.Id,
                        DisplayName = result.DisplayName,
                        Latitude = result.Latitude,
                        Longitude = result.Longitude,
                        BoundingBox = result.BoundingBox,
                    })
                ]
            });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid geocoding request");
            return BadRequest(ex.Message);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogWarning(ex, "Geocoding provider unavailable");
            return StatusCode(StatusCodes.Status503ServiceUnavailable, "Geocoding service unavailable.");
        }
    }

    [HttpPost("reverse")]
    public async Task<ActionResult<ReverseGeocodeResponse>> Reverse([FromBody] ReverseGeocodeRequest request)
    {
        if (request.Latitude is < -90 or > 90 || request.Longitude is < -180 or > 180)
        {
            return BadRequest("Latitude or longitude out of range.");
        }

        try
        {
            var address = await _geocodeService.ReverseGeocodeAsync(request.Latitude, request.Longitude);
            return Ok(new ReverseGeocodeResponse
            {
                Address = address,
                Latitude = request.Latitude,
                Longitude = request.Longitude,
            });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid reverse geocoding request");
            return BadRequest(ex.Message);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogWarning(ex, "Reverse geocoding provider unavailable");
            return StatusCode(StatusCodes.Status503ServiceUnavailable, "Geocoding service unavailable.");
        }
    }
}