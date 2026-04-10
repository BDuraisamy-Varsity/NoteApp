using System.Net;
using System.Text.Json;

namespace NoteApp.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
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
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var correlationId = context.Items["X-Correlation-ID"]?.ToString() ?? "unknown";

        _logger.LogError(exception,
            "Unhandled exception. CorrelationId={CorrelationId} Path={Path}",
            correlationId, context.Request.Path);

        var (statusCode, title) = MapExceptionToResponse(exception);

        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = (int)statusCode;

        var problem = new
        {
            type = $"https://httpstatuses.io/{(int)statusCode}",
            title,
            status = (int)statusCode,
            detail = exception.Message,
            correlationId
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(problem));
    }

    private static (HttpStatusCode statusCode, string title) MapExceptionToResponse(Exception exception)
    {
        return exception switch
        {
            ArgumentException => (HttpStatusCode.BadRequest, "Bad Request"),
            KeyNotFoundException => (HttpStatusCode.NotFound, "Not Found"),
            UnauthorizedAccessException => (HttpStatusCode.Unauthorized, "Unauthorized"),
            _ => (HttpStatusCode.InternalServerError, "An unexpected error occurred")
        };
    }
}
