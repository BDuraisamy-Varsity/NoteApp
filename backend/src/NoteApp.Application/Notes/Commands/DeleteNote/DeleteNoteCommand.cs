using MediatR;

namespace NoteApp.Application.Notes.Commands.DeleteNote;

public record DeleteNoteCommand(Guid Id) : IRequest<bool>;
