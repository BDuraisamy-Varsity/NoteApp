using NoteApp.Domain.Entities;

namespace NoteApp.Domain.Interfaces;

public record TodoItemUpdate(Guid Id, string Text, bool IsCompleted, int Order);

public interface INoteRepository
{
    Task<IEnumerable<Note>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Note?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Note>> SearchAsync(string keyword, CancellationToken cancellationToken = default);
    Task<IEnumerable<Note>> GetByTagAsync(string tagName, CancellationToken cancellationToken = default);
    Task<IEnumerable<Note>> GetByFlagAsync(FlagLevel flag, CancellationToken cancellationToken = default);
    Task AddAsync(Note note, CancellationToken cancellationToken = default);
    Task UpdateAsync(Note note, List<string> tags, List<TodoItemUpdate> todoItems, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
