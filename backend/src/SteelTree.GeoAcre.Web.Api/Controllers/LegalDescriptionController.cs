using SteelTree.GeoAcre.Services;
using SteelTree.GeoAcre.Web.Api.Models;

namespace SteelTree.GeoAcre.Web.Api.Controllers;

[ApiController]
[Route("api/legal-description")]
public class LegalDescriptionController : ControllerBase
{
    private readonly ILegalDescriptionService _legalDescriptionService;
    private readonly ILogger<LegalDescriptionController> _logger;

    public LegalDescriptionController(
        ILegalDescriptionService legalDescriptionService,
        ILogger<LegalDescriptionController> logger)
    {
        _legalDescriptionService = legalDescriptionService;
        _logger = logger;
    }

    [HttpPost("interpret")]
    public async Task<IActionResult> Interpret(
        [FromBody] LegalDescriptionInterpretRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var command = new LegalDescriptionInterpretCommand
            {
                SourceType = request.Source.Type,
                Text = request.Source.Text,
                FileName = request.Source.FileName,
                ContentType = request.Source.ContentType,
                Base64Content = request.Source.Base64Content,
                MaxVertices = request.Options?.MaxVertices,
                ConfidenceThreshold = request.Options?.ConfidenceThreshold,
            };

            var result = await _legalDescriptionService.InterpretAsync(command, cancellationToken);
            if (result.Response is not null)
            {
                var payload = new LegalDescriptionInterpretResponse
                {
                    Mode = result.Response.Mode,
                    SchemaVersion = result.Response.SchemaVersion,
                    Interpretation = new LegalDescriptionInterpretationDto
                    {
                        Status = result.Response.Status,
                        Confidence = result.Response.Confidence,
                        Diagnostics = result.Response.Diagnostics,
                    },
                    Boundary = result.Response.Boundary is null
                        ? null
                        : new LegalDescriptionBoundaryDto
                        {
                            Provenance = result.Response.Boundary.Provenance,
                            IsReadOnly = result.Response.Boundary.IsReadOnly,
                            Vertices =
                            [
                                .. result.Response.Boundary.Vertices.Select(v =>
                                    new LatLngDto { Latitude = v.Latitude, Longitude = v.Longitude })
                            ],
                            AreaSquareMeters = result.Response.Boundary.AreaSquareMeters,
                            PerimeterMeters = result.Response.Boundary.PerimeterMeters,
                            HasSelfIntersection = result.Response.Boundary.HasSelfIntersection,
                        },
                    Retry = result.Response.Retry is null
                        ? null
                        : new RetryGuidanceDto
                        {
                            Allowed = result.Response.Retry.Allowed,
                            Message = result.Response.Retry.Message,
                        },
                };

                return StatusCode(result.StatusCode, payload);
            }

            return StatusCode(result.StatusCode, new { error = result.Error, code = result.Code });
        }
        catch (HttpRequestException ex)
        {
            _logger.LogWarning(ex, "Legal interpretation provider unavailable");
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                error = "Legal interpretation provider unavailable",
                code = "SERVICE_UNAVAILABLE",
            });
        }
    }
}
