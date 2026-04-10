using AutoMapper;
using MediatR;
using Microsoft.Extensions.Logging;
using NoteApp.Application.DTOs;
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

        note.Title     = request.Title;
        note.Body      = request.Body;
        note.Flag      = request.Flag;
        note.UpdatedAt = DateTime.UtcNow;

        var todoUpdates = request.TodoItems
            .Select((t, i) => new TodoItemUpdate(t.Id, t.Text, t.IsCompleted, i))
            .ToList();

        await _repository.UpdateAsync(note, request.Tags, todoUpdates, cancellationToken);

        _logger.LogInformation("Note updated. NoteId={NoteId}", note.Id);

        return _mapper.Map<NoteDto>(note);
    }
}
