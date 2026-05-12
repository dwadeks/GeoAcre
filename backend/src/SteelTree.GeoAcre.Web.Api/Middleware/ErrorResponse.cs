namespace SteelTree.GeoAcre.Web.Api.Middleware;

/// <summary>
/// Standard error response DTO.
/// </summary>
public class ErrorResponse
{
    /// <summary>
    /// HTTP status code.
    /// </summary>
    public int Status { get; set; }

    /// <summary>
    /// Short error title.
    /// </summary>
    public string? Title { get; set; }

    /// <summary>
    /// Detailed error message.
    /// </summary>
    public string? Message { get; set; }

    /// <summary>
    /// Additional error details.
    /// </summary>
    public string? Details { get; set; }
}
