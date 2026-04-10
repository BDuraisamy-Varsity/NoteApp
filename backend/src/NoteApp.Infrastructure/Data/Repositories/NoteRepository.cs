using Microsoft.EntityFrameworkCore;
using NoteApp.Domain.Entities;
using NoteApp.Domain.Interfaces;
using NoteApp.Infrastructure.Security;

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

    public async Task UpdateAsync(Note note, CancellationToken cancellationToken = default)
    {
        _context.Notes.Update(note);
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
