using NoteApp.Domain.Entities;

namespace NoteApp.Application.DTOs;

public class NoteDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public FlagLevel Flag { get; set; } = FlagLevel.None;
    public List<string> Tags { get; set; } = new();
    public List<TodoItemDto> TodoItems { get; set; } = new();
}

public class TodoItemDto
{
    public Guid Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public int Order { get; set; }
}
