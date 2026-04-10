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
        note.NoteTags = request.Tags
            .Where(t => !string.IsNullOrWhiteSpace(t))
            .Select(t => new NoteTag
            {
                NoteId = note.Id,
                Tag = new Tag { Name = t.Trim().ToLowerInvariant() }
            }).ToList();
        note.TodoItems = request.TodoItems.Select((t, i) => new TodoItem
        {
            Id = t.Id == Guid.Empty ? Guid.NewGuid() : t.Id,
            Text = t.Text,
            IsCompleted = t.IsCompleted,
            Order = i,
            NoteId = note.Id
        }).ToList();
    }
}
