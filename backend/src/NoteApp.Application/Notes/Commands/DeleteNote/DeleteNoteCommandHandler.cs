using MediatR;
using Microsoft.Extensions.Logging;
using NoteApp.Domain.Interfaces;

namespace NoteApp.Application.Notes.Commands.DeleteNote;

public class DeleteNoteCommandHandler : IRequestHandler<DeleteNoteCommand, bool>
{
    private readonly INoteRepository _repository;
    private readonly ILogger<DeleteNoteCommandHandler> _logger;

    public DeleteNoteCommandHandler(INoteRepository repository, ILogger<DeleteNoteCommandHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<bool> Handle(DeleteNoteCommand request, CancellationToken cancellationToken)
    {
        var note = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (note is null) return false;

        await _repository.DeleteAsync(request.Id, cancellationToken);
        _logger.LogInformation("Note deleted. NoteId={NoteId}", request.Id);

        return true;
    }
}
