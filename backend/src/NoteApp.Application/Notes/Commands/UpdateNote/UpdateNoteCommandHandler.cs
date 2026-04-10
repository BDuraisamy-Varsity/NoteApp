using AutoMapper;
using MediatR;
using Microsoft.Extensions.Logging;
using NoteApp.Application.DTOs;
using NoteApp.Domain.Entities;
using NoteApp.Domain.Interfaces;

namespace NoteApp.Application.Notes.Commands.UpdateNote;

public class UpdateNoteCommandHandler : IRequestHandler<UpdateNoteCommand, NoteDto?>
{
    private readonly INoteRepository _repository;
    private readonly IMapper _mapper;
    private readonly ILogger<UpdateNoteCommandHandler> _logger;

    public UpdateNoteCommandHandler(
        INoteRepository repository,
        IMapper mapper,
        ILogger<UpdateNoteCommandHandler> logger)
    {
        _repository = repository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<NoteDto?> Handle(UpdateNoteCommand request, CancellationToken cancellationToken)
    {
        var note = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (note is null) return null;

        ApplyUpdates(note, request);
        await _repository.UpdateAsync(note, cancellationToken);

        _logger.LogInformation("Note updated. NoteId={NoteId}", note.Id);

        return _mapper.Map<NoteDto>(note);
    }

    private static void ApplyUpdates(Note note, UpdateNoteCommand request)
    {
        note.Title = request.Title;
        note.Body = request.Body;
        note.Flag = request.Flag;
        note.UpdatedAt = DateTime.UtcNow;

        // Mutate tracked collections in-place so EF Core's change tracker
        // correctly issues DELETEs for removed items and INSERTs for new ones.
        // Replacing the collection reference causes DbUpdateConcurrencyException.
        note.NoteTags.Clear();
        foreach (var tag in request.Tags.Where(t => !string.IsNullOrWhiteSpace(t)))
        {
            note.NoteTags.Add(new NoteTag
            {
                NoteId = note.Id,
                Tag = new Tag { Name = tag.Trim().ToLowerInvariant() },
            });
        }

        note.TodoItems.Clear();
        for (int i = 0; i < request.TodoItems.Count; i++)
        {
            var t = request.TodoItems[i];
            note.TodoItems.Add(new TodoItem
            {
                Id = t.Id == Guid.Empty ? Guid.NewGuid() : t.Id,
                Text = t.Text,
                IsCompleted = t.IsCompleted,
                Order = i,
                NoteId = note.Id,
            });
        }
    }
}
