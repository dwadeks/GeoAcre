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
    private static readonly (string Scope, string Prefix, int Limit, TimeSpan Window)[] Rules =
    [
        ("geocoding", "/api/geocoding", 10, TimeSpan.FromSeconds(1)),
        ("geometry", "/api/geometry", 100, TimeSpan.FromSeconds(1)),
        ("global", "/api", 1000, TimeSpan.FromHours(1)),
    ];

    public RateLimitingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value ?? string.Empty;
        if (!path.StartsWith("/api", StringComparison.OrdinalIgnoreCase))
        {
            await _next(context);
            return;
        }

        var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var now = DateTime.UtcNow;

        foreach (var rule in Rules)
        {
            if (!path.StartsWith(rule.Prefix, StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            var queueKey = $"{rule.Scope}:{ip}";
            var queue = RequestsByIp.GetOrAdd(queueKey, _ => new Queue<DateTime>());
            int remaining;
            DateTime resetAt;
            bool exceeded;

            lock (queue)
            {
                while (queue.Count > 0 && now - queue.Peek() > rule.Window)
                {
                    queue.Dequeue();
                }

                exceeded = queue.Count >= rule.Limit;

                if (!exceeded)
                {
                    queue.Enqueue(now);
                }

                remaining = Math.Max(0, rule.Limit - queue.Count);
                resetAt = queue.Count > 0 ? queue.Peek().Add(rule.Window) : now.Add(rule.Window);
            }

            context.Response.Headers["X-RateLimit-Limit"] = rule.Limit.ToString();
            context.Response.Headers["X-RateLimit-Remaining"] = remaining.ToString();
            context.Response.Headers["X-RateLimit-Reset"] =
                new DateTimeOffset(resetAt).ToUnixTimeSeconds().ToString();

            if (exceeded)
            {
                context.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsJsonAsync(new
                {
                    status = 429,
                    title = "Too Many Requests",
                    message = $"Rate limit exceeded for {rule.Scope}. Try again shortly.",
                });
                return;
            }
        }

        await _next(context);
    }
}