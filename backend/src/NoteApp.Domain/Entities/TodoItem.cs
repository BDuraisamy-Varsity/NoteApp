namespace NoteApp.Domain.Entities;

public class TodoItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Text { get; set; } = string.Empty;
    public bool IsCompleted { get; set; } = false;
    public int Order { get; set; }

    public Guid NoteId { get; set; }
    public Note Note { get; set; } = null!;
}
