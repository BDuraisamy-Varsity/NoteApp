namespace NoteApp.Domain.Entities;

public class Note
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public bool IsDeleted { get; set; } = false;
    public FlagLevel Flag { get; set; } = FlagLevel.None;

    public ICollection<NoteTag> NoteTags { get; set; } = new List<NoteTag>();
    public ICollection<TodoItem> TodoItems { get; set; } = new List<TodoItem>();
}
