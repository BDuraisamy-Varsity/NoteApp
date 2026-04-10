using System.Diagnostics;

namespace NoteApp.API.Middleware;

public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        var correlationId = context.Items["X-Correlation-ID"]?.ToString() ?? "unknown";

        _logger.LogInformation(
            "Request started. Method={Method} Path={Path} CorrelationId={CorrelationId}",
            context.Request.Method, context.Request.Path, correlationId);

        await _next(context);

        stopwatch.Stop();

        _logger.LogInformation(
            "Request completed. Method={Method} Path={Path} StatusCode={StatusCode} Duration={Duration}ms CorrelationId={CorrelationId}",
            context.Request.Method, context.Request.Path,
            context.Response.StatusCode, stopwatch.ElapsedMilliseconds, correlationId);
    }
}
