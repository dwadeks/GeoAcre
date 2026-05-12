using SteelTree.GeoAcre.Web.Api.Models;
using SteelTree.GeoAcre.Web.Api.Services;

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
            var result = await _legalDescriptionService.InterpretAsync(request, cancellationToken);
            if (result.Response is not null)
            {
                return StatusCode(result.StatusCode, result.Response);
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
