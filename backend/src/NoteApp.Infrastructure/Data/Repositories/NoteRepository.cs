using Microsoft.EntityFrameworkCore;
using NoteApp.Domain.Entities;
using NoteApp.Domain.Interfaces;

namespace NoteApp.Infrastructure.Data.Repositories;

public class NoteRepository : INoteRepository
{
    private readonly NoteDbContext _context;

    public NoteRepository(NoteDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Note>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Notes
            .Include(n => n.NoteTags).ThenInclude(nt => nt.Tag)
            .Include(n => n.TodoItems)
            .OrderByDescending(n => n.UpdatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Note?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Notes
            .Include(n => n.NoteTags).ThenInclude(nt => nt.Tag)
            .Include(n => n.TodoItems.OrderBy(t => t.Order))
            .FirstOrDefaultAsync(n => n.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Note>> SearchAsync(string keyword, CancellationToken cancellationToken = default)
    {
        var lowerKeyword = keyword.ToLowerInvariant();
        return await _context.Notes
            .Include(n => n.NoteTags).ThenInclude(nt => nt.Tag)
            .Include(n => n.TodoItems)
            .Where(n => n.Title.ToLower().Contains(lowerKeyword)
                     || n.Body.ToLower().Contains(lowerKeyword))
            .OrderByDescending(n => n.UpdatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Note>> GetByFlagAsync(FlagLevel flag, CancellationToken cancellationToken = default)
    {
        return await _context.Notes
            .Include(n => n.NoteTags).ThenInclude(nt => nt.Tag)
            .Include(n => n.TodoItems)
            .Where(n => n.Flag == flag)
            .OrderByDescending(n => n.UpdatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Note>> GetByTagAsync(string tagName, CancellationToken cancellationToken = default)
    {
        var lowerTag = tagName.ToLowerInvariant();
        return await _context.Notes
            .Include(n => n.NoteTags).ThenInclude(nt => nt.Tag)
            .Include(n => n.TodoItems)
            .Where(n => n.NoteTags.Any(nt => nt.Tag.Name == lowerTag))
            .OrderByDescending(n => n.UpdatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Note note, CancellationToken cancellationToken = default)
    {
        await _context.Notes.AddAsync(note, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(
        Note note,
        List<string> tags,
        List<TodoItemUpdate> todoItems,
        CancellationToken cancellationToken = default)
    {
        // ── Step 1: Save scalar note changes (Title, Body, Flag, UpdatedAt) ───
        // Note is already tracked from GetByIdAsync — SaveChanges picks up changes.
        await _context.SaveChangesAsync(cancellationToken);

        // ── Step 2: Bulk-delete old children directly, bypassing the change
        // tracker to avoid DbUpdateConcurrencyException. ──────────────────────
        await _context.TodoItems
            .Where(t => t.NoteId == note.Id)
            .ExecuteDeleteAsync(cancellationToken);

        await _context.NoteTags
            .Where(nt => nt.NoteId == note.Id)
            .ExecuteDeleteAsync(cancellationToken);

        // ── Step 3: Insert new TodoItems ──────────────────────────────────────
        var newTodos = todoItems.Select(t => new TodoItem
        {
            Id          = t.Id == Guid.Empty ? Guid.NewGuid() : t.Id,
            Text        = t.Text,
            IsCompleted = t.IsCompleted,
            Order       = t.Order,
            NoteId      = note.Id,
        }).ToList();
        await _context.TodoItems.AddRangeAsync(newTodos, cancellationToken);

        // ── Step 4: Resolve tags (find existing by name, create if new) ───────
        foreach (var tagName in tags.Where(t => !string.IsNullOrWhiteSpace(t)))
        {
            var name = tagName.Trim().ToLowerInvariant();
            var tag = await _context.Tags.FirstOrDefaultAsync(t => t.Name == name, cancellationToken)
                      ?? new Tag { Name = name };

            _context.NoteTags.Add(new NoteTag { NoteId = note.Id, Tag = tag });
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var note = await _context.Notes.FindAsync([id], cancellationToken);
        if (note is not null)
        {
            note.IsDeleted = true;
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
