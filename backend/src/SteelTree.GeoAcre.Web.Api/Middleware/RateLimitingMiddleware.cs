using System.Collections.Concurrent;

namespace SteelTree.GeoAcre.Web.Api.Middleware;

/// <summary>
/// Basic in-memory rate limiting middleware for geocoding endpoints.
/// Limits requests per IP to 10 req/sec for /api/geocode/* routes.
/// </summary>
public class RateLimitingMiddleware
{
    private readonly RequestDelegate _next;
    private static readonly ConcurrentDictionary<string, Queue<DateTime>> RequestsByIp = new();
    private const int MaxRequestsPerSecond = 10;
    private static readonly TimeSpan Window = TimeSpan.FromSeconds(1);

    public RateLimitingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value ?? string.Empty;
        if (!path.StartsWith("/api/geocode", StringComparison.OrdinalIgnoreCase))
        {
            await _next(context);
            return;
        }

        var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var now = DateTime.UtcNow;

        var queue = RequestsByIp.GetOrAdd(ip, _ => new Queue<DateTime>());
        lock (queue)
        {
            while (queue.Count > 0 && now - queue.Peek() > Window)
            {
                queue.Dequeue();
            }

            if (queue.Count >= MaxRequestsPerSecond)
            {
                context.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                context.Response.ContentType = "application/json";
                context.Response.WriteAsJsonAsync(new
                {
                    status = 429,
                    title = "Too Many Requests",
                    message = "Geocoding rate limit exceeded. Try again shortly."
                }).GetAwaiter().GetResult();
                return;
            }

            queue.Enqueue(now);
        }

        await _next(context);
    }
}