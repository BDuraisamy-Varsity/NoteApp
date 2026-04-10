using Anthropic;
using Microsoft.Extensions.Logging;
using NoteApp.Application.AI;
using NoteApp.Domain.Interfaces;

namespace NoteApp.Infrastructure.AI;

public class ClaudeAIService : IClaudeAIService
{
    private readonly ILogger<ClaudeAIService> _logger;
    private readonly INoteRepository _noteRepository;

    // us.anthropic.claude-sonnet-4-6 routed via Portkey → AWS Bedrock us-east-2
    private const string Model = "us.anthropic.claude-sonnet-4-6";

    private const string SystemPromptAgent = """
        You are a helpful note-taking assistant with access to the user's notes.
        Use the provided tools to read, create, update, or delete notes as requested.
        After completing all needed operations, provide a friendly summary of what you did.
        """;

    public ClaudeAIService(ILogger<ClaudeAIService> logger, INoteRepository noteRepository)
    {
        _logger = logger;
        _noteRepository = noteRepository;
    }

    public async Task<List<string>> SuggestTagsAsync(string title, string body, CancellationToken cancellationToken = default)
    {
        var prompt = $"""
            Suggest 3-5 concise, relevant tags for the following note.
            Return ONLY a JSON array of lowercase strings, e.g. ["work","meeting","action"].
            No explanation, no markdown fences — raw JSON array only.

            Title: {title}
            Body: {body}
            """;

        using var api = BuildClient();

        var response = await api.CreateMessageAsync(
            model: Model,
            messages: [prompt],
            maxTokens: 256,
            topP: null,
            cancellationToken: cancellationToken);

        var raw = ExtractText(response).Trim();

        try
        {
            var tags = System.Text.Json.JsonSerializer.Deserialize<List<string>>(raw) ?? [];
            _logger.LogInformation("Suggested {Count} tags for note '{Title}'", tags.Count, title);
            return tags;
        }
        catch (System.Text.Json.JsonException ex)
        {
            _logger.LogWarning(ex, "Failed to parse tag suggestion JSON: {Raw}", raw);
            return [];
        }
    }

    public async Task<string> SummarizeAsync(string title, string body, CancellationToken cancellationToken = default)
    {
        var prompt = $"""
            Summarize the following note in 1-2 concise sentences.
            Return ONLY the summary — no labels, no preamble.

            Title: {title}
            Body: {body}
            """;

        using var api = BuildClient();

        var response = await api.CreateMessageAsync(
            model: Model,
            messages: [prompt],
            maxTokens: 256,
            topP: null,
            cancellationToken: cancellationToken);

        var summary = ExtractText(response).Trim();
        _logger.LogInformation("Summarized note '{Title}'", title);
        return summary;
    }

    public async Task<AgentResponse> RunAgentAsync(string userMessage, CancellationToken cancellationToken = default)
    {
        using var api = BuildClient();
        var service = new NoteAgentToolsService(_noteRepository);
        var tools = service.AsTools();

        List<Message> messages = [userMessage];

        Message response;
        string finalMessage = "Done.";
        const int maxIterations = 10;

        for (int i = 0; i < maxIterations; i++)
        {
            response = await api.CreateMessageAsync(
                model: Model,
                messages: messages,
                maxTokens: 1024,
                system: SystemPromptAgent,
                toolChoice: new ToolChoice { Type = ToolChoiceType.Auto },
                tools: tools,
                topP: null,
                cancellationToken: cancellationToken);

            messages.Add(response.AsRequestMessage());

            var toolUses = response.Content.Value2?
                .Where(b => b.IsToolUse)
                .Select(b => b.ToolUse)
                .ToList() ?? [];

            if (toolUses.Count == 0)
            {
                finalMessage = ExtractText(response).Trim();
                break;
            }

            foreach (var toolUse in toolUses)
            {
                var json = await service.CallAsync(
                    functionName: toolUse!.Name,
                    argumentsAsJson: toolUse.Input.AsJson(),
                    cancellationToken: cancellationToken);

                messages.Add(json.AsToolCall(toolUse));
            }
        }

        _logger.LogInformation("Agent done. NotesAffected={Count} Actions={Actions}",
            service.NotesAffected, string.Join(", ", service.Actions));

        return new AgentResponse(finalMessage, service.NotesAffected, service.Actions);
    }

    private static AnthropicApi BuildClient()
    {
        var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Add("x-portkey-api-key", "QpTVFFwhjnUnMA1m1r755TpnIwle");
        httpClient.DefaultRequestHeaders.Add("x-portkey-provider", "@aws-bedrock-use2");

        var baseUri = new Uri("https://portkeygateway.perficient.com/v1");
        return new AnthropicApi(httpClient, baseUri);
    }

    private static string ExtractText(Message response)
    {
        // Content is OneOf<string, IList<Block>> — Value1 = string, Value2 = block list
        if (response.Content.IsValue1)
            return response.Content.Value1 ?? string.Empty;

        var blocks = response.Content.Value2;
        if (blocks is null) return string.Empty;
        foreach (var block in blocks)
        {
            if (block.IsText) return block.Text?.Text ?? string.Empty;
        }
        return string.Empty;
    }
}
