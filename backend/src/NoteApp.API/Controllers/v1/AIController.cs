using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using NoteApp.Application.AI;

namespace NoteApp.API.Controllers.v1;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Produces("application/json")]
public class AIController : ControllerBase
{
    private readonly IClaudeAIService _aiService;
    private readonly ILogger<AIController> _logger;

    public AIController(IClaudeAIService aiService, ILogger<AIController> logger)
    {
        _aiService = aiService;
        _logger = logger;
    }

    /// <summary>Suggests tags for a note using Claude AI.</summary>
    [HttpPost("suggest-tags")]
    [ProducesResponseType(typeof(SuggestTagsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SuggestTags(
        [FromBody] SuggestTagsRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
            return BadRequest("Title is required.");

        var tags = await _aiService.SuggestTagsAsync(request.Title, request.Body, cancellationToken);
        return Ok(new SuggestTagsResponse(tags));
    }

    /// <summary>Summarizes a note using Claude AI.</summary>
    [HttpPost("summarize")]
    [ProducesResponseType(typeof(SummarizeResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Summarize(
        [FromBody] SummarizeRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
            return BadRequest("Title is required.");

        var summary = await _aiService.SummarizeAsync(request.Title, request.Body, cancellationToken);
        return Ok(new SummarizeResponse(summary));
    }

    /// <summary>Sends a message to the Claude agent for note management (Day 5).</summary>
    [HttpPost("agent")]
    [ProducesResponseType(typeof(AgentResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Agent(
        [FromBody] AgentRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest("Message is required.");

        _logger.LogInformation("Agent request received: {Message}", request.Message);
        var response = await _aiService.RunAgentAsync(request.Message, cancellationToken);
        return Ok(response);
    }
}

public record SuggestTagsRequest(string Title, string Body);
public record SuggestTagsResponse(List<string> Tags);
public record SummarizeRequest(string Title, string Body);
public record SummarizeResponse(string Summary);
public record AgentRequest(string Message);
