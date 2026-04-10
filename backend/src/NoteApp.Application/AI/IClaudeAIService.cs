namespace NoteApp.Application.AI;

public interface IClaudeAIService
{
    Task<List<string>> SuggestTagsAsync(string title, string body, CancellationToken cancellationToken = default);
    Task<string> SummarizeAsync(string title, string body, CancellationToken cancellationToken = default);
    Task<AgentResponse> RunAgentAsync(string userMessage, CancellationToken cancellationToken = default);
}

public record AgentResponse(string Message, int NotesAffected, List<string> Actions);
