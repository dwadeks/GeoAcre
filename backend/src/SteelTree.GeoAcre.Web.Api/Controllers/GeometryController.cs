using Microsoft.AspNetCore.Mvc;
using SteelTree.GeoAcre.Geometry;
using SteelTree.GeoAcre.Web.Api.Models;
using System.ComponentModel.DataAnnotations;

namespace SteelTree.GeoAcre.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GeometryController : ControllerBase
    {
        private readonly ILogger<GeometryController> _logger;

        public GeometryController(ILogger<GeometryController> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Calculate polygon area with optional exclude areas
        /// </summary>
        /// <param name="request">Vertices for primary polygon and optional exclude polygons</param>
        /// <returns>Calculated area in square meters and side lengths</returns>
        [HttpPost("calculate-area")]
        public ActionResult<CalculateAreaResponse> CalculateArea(
            [FromBody, Required] CalculateAreaRequest request
        )
        {
            try
            {
                // Validate input
                if (request?.Vertices == null || request.Vertices.Length < 3)
                {
                    return BadRequest(new { error = "Polygon must have at least 3 vertices" });
                }

                // Convert DTOs to domain models
                var vertices = request.Vertices
                    .Select(v => new GeoPoint(v.Latitude, v.Longitude))
                    .ToList();

                // Create primary polygon
                var primaryPolygon = new Polygon(
                    Guid.NewGuid(),
                    vertices,
                    isExcludePolygon: false,
                    parentPolygonId: null
                );

                // Calculate primary area
                var primaryArea = primaryPolygon.ComputedAreaSquareMeters;
                var primaryPerimeter = primaryPolygon.ComputedPerimeterMeters;
                var perSideLengths = primaryPolygon.PerSideLengthsMeters;

                // Calculate excluded area if provided
                double excludedAreaTotal = 0;
                if (request.ExcludePolygons != null && request.ExcludePolygons.Length > 0)
                {
                    foreach (var excludeVertices in request.ExcludePolygons)
                    {
                        if (excludeVertices == null || excludeVertices.Length < 3)
                            continue;

                        var excludeGeoPoints = excludeVertices
                            .Select(v => new GeoPoint(v.Latitude, v.Longitude))
                            .ToList();

                        var excludePolygon = new Polygon(
                            Guid.NewGuid(),
                            excludeGeoPoints,
                            isExcludePolygon: true,
                            parentPolygonId: primaryPolygon.Id
                        );

                        excludedAreaTotal += excludePolygon.ComputedAreaSquareMeters;
                    }
                }

                var netArea = Math.Max(0, primaryArea - excludedAreaTotal);

                return Ok(new CalculateAreaResponse
                {
                    AreaSquareMeters = primaryArea,
                    NetAreaSquareMeters = netArea,
                    ExcludedAreaSquareMeters = excludedAreaTotal,
                    PerSideLengthsMeters = perSideLengths.ToArray(),
                    HasIntersections = primaryPolygon.HasIntersections
                });
            }
            catch (InvalidCoordinateException ex)
            {
                _logger.LogWarning(ex, "Invalid coordinates provided");
                return BadRequest(new { error = ex.Message });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument");
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating area");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }
    }
}
