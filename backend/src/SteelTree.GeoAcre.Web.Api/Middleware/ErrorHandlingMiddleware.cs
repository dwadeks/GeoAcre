namespace SteelTree.GeoAcre.Web.Api.Middleware;

/// <summary>
/// Middleware for handling and standardizing error responses across the API.
/// </summary>
public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var traceId = context.TraceIdentifier;

        var response = new ErrorResponse
        {
            Message = exception.Message,
            Details = $"{exception.GetType().Name} (traceId: {traceId})"
        };

        return exception switch
        {
            ArgumentException => RespondWithError(context, 400, response, "Bad Request"),
            InvalidOperationException => RespondWithError(context, 400, response, "Bad Request"),
            HttpRequestException => RespondWithError(context, 503, response, "Service Unavailable"),
            _ => RespondWithError(context, 500, response, "Internal Server Error")
        };
    }

    private static Task RespondWithError(HttpContext context, int statusCode, ErrorResponse response, string title)
    {
        context.Response.StatusCode = statusCode;
        response.Title = title;
        response.Status = statusCode;
        return context.Response.WriteAsJsonAsync(response);
    }
}

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
