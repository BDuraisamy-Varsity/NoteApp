using System.ComponentModel;
using System.Text.Json;
using Anthropic;
using NoteApp.Application.DTOs;
using NoteApp.Domain.Entities;
using NoteApp.Domain.Interfaces;
using NoteApp.Domain.Interfaces;

namespace NoteApp.Infrastructure.AI;

[AnthropicTools]
public interface INoteAgentTools
{
    // Note: [AnthropicTools] generator always appends CancellationToken to every call.
    // ListNotesAsync has no real params so a dummy param is required to avoid generator CS0839 bug.
    [Description("List all notes. Returns id, title, flag, and tags for each note.")]
    Task<string> ListNotesAsync(
        [Description("Pass empty string — not used")] string filter = "",
        CancellationToken cancellationToken = default);

    [Description("Search notes by keyword across title and body.")]
    Task<string> SearchNotesAsync(
        [Description("Search keyword")] string keyword,
        CancellationToken cancellationToken = default);

    [Description("Get full details of a single note by its ID.")]
    Task<string> GetNoteAsync(
        [Description("Note GUID")] string id,
        CancellationToken cancellationToken = default);

    [Description("Create a new note. Returns the created note ID and title.")]
    Task<string> CreateNoteAsync(
        [Description("Note title")] string title,
        [Description("Note body text")] string body,
        [Description("Priority: None, Low, Normal, Important, High, Critical")] string flag = "None",
        [Description("Comma-separated tags, e.g. 'work,meeting'")] string tags = "",
        CancellationToken cancellationToken = default);

    [Description("Update an existing note by ID. Only supplied fields are changed.")]
    Task<string> UpdateNoteAsync(
        [Description("Note GUID")] string id,
        [Description("New title (empty = keep current)")] string title = "",
        [Description("New body (empty = keep current)")] string body = "",
        [Description("New flag (empty = keep current)")] string flag = "",
        [Description("Comma-separated replacement tags (empty = keep current)")] string tags = "",
        CancellationToken cancellationToken = default);

    [Description("Permanently delete a note by ID.")]
    Task<string> DeleteNoteAsync(
        [Description("Note GUID to delete")] string id,
        CancellationToken cancellationToken = default);
}

public class NoteAgentToolsService : INoteAgentTools
{
    private readonly INoteRepository _repository;
    public readonly List<string> Actions = [];
    public int NotesAffected;

    public NoteAgentToolsService(INoteRepository repository)
    {
        _repository = repository;
    }

    public async Task<string> ListNotesAsync(string filter = "", CancellationToken cancellationToken = default)
    {
        var notes = (await _repository.GetAllAsync(cancellationToken)).ToList();
        Actions.Add($"listed {notes.Count} notes");
        var result = notes.Select(n => new
        {
            n.Id, n.Title,
            Flag = n.Flag.ToString(),
            Tags = n.NoteTags.Select(t => t.Tag?.Name ?? ""),
        });
        return JsonSerializer.Serialize(result);
    }

    public async Task<string> SearchNotesAsync(string keyword, CancellationToken cancellationToken = default)
    {
        var notes = (await _repository.SearchAsync(keyword, cancellationToken)).ToList();
        Actions.Add($"searched '{keyword}', {notes.Count} results");
        var result = notes.Select(n => new { n.Id, n.Title, Preview = n.Body.Length > 100 ? n.Body[..100] : n.Body });
        return JsonSerializer.Serialize(result);
    }

    public async Task<string> GetNoteAsync(string id, CancellationToken cancellationToken = default)
    {
        if (!Guid.TryParse(id, out var guid))
            return @"{""error"":""Invalid ID format""}";

        var note = await _repository.GetByIdAsync(guid, cancellationToken);
        if (note is null) return @"{""error"":""Note not found""}";

        Actions.Add($"read note '{note.Title}'");
        return JsonSerializer.Serialize(MapToDto(note));
    }

    public async Task<string> CreateNoteAsync(
        string title, string body, string flag = "None", string tags = "",
        CancellationToken cancellationToken = default)
    {
        var note = new Note
        {
            Title = title,
            Body  = body,
            Flag  = ParseFlag(flag),
        };
        ApplyTags(note, tags);
        await _repository.AddAsync(note, cancellationToken);

        Actions.Add($"created note '{note.Title}'");
        NotesAffected++;
        return JsonSerializer.Serialize(new { note.Id, note.Title, Status = "created" });
    }

    public async Task<string> UpdateNoteAsync(
        string id, string title = "", string body = "", string flag = "", string tags = "",
        CancellationToken cancellationToken = default)
    {
        if (!Guid.TryParse(id, out var guid))
            return @"{""error"":""Invalid ID format""}";

        var note = await _repository.GetByIdAsync(guid, cancellationToken);
        if (note is null) return @"{""error"":""Note not found""}";

        if (!string.IsNullOrWhiteSpace(title)) note.Title = title;
        if (!string.IsNullOrWhiteSpace(body))  note.Body  = body;
        if (!string.IsNullOrWhiteSpace(flag))  note.Flag  = ParseFlag(flag);
        note.UpdatedAt = DateTime.UtcNow;

        var newTags = string.IsNullOrWhiteSpace(tags)
            ? note.NoteTags.Select(nt => nt.Tag?.Name ?? "").Where(t => t.Length > 0).ToList()
            : tags.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

        var existingTodos = note.TodoItems
            .Select(t => new TodoItemUpdate(t.Id, t.Text, t.IsCompleted, t.Order))
            .ToList();

        await _repository.UpdateAsync(note, newTags, existingTodos, cancellationToken);

        Actions.Add($"updated note '{note.Title}'");
        NotesAffected++;
        return JsonSerializer.Serialize(new { note.Id, note.Title, Status = "updated" });
    }

    public async Task<string> DeleteNoteAsync(string id, CancellationToken cancellationToken = default)
    {
        if (!Guid.TryParse(id, out var guid))
            return @"{""error"":""Invalid ID format""}";

        var note = await _repository.GetByIdAsync(guid, cancellationToken);
        await _repository.DeleteAsync(guid, cancellationToken);

        Actions.Add($"deleted note '{note?.Title ?? id}'");
        NotesAffected++;
        return JsonSerializer.Serialize(new { Id = guid, Status = "deleted" });
    }

    private static NoteDto MapToDto(Note note) => new()
    {
        Id = note.Id, Title = note.Title, Body = note.Body,
        CreatedAt = note.CreatedAt, UpdatedAt = note.UpdatedAt, Flag = note.Flag,
        Tags = note.NoteTags.Select(t => t.Tag?.Name ?? "").ToList(),
        TodoItems = note.TodoItems
            .OrderBy(t => t.Order)
            .Select(t => new TodoItemDto { Id = t.Id, Text = t.Text, IsCompleted = t.IsCompleted, Order = t.Order })
            .ToList(),
    };

    private static void ApplyTags(Note note, string tags)
    {
        note.NoteTags = tags
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(t => !string.IsNullOrWhiteSpace(t))
            .Select(t => new NoteTag { Tag = new Tag { Name = t.ToLowerInvariant() } })
            .ToList();
    }

    private static FlagLevel ParseFlag(string? value)
        => Enum.TryParse<FlagLevel>(value, ignoreCase: true, out var f) ? f : FlagLevel.None;
}
