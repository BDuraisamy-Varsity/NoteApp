using MediatR;
using NoteApp.Application.DTOs;

namespace NoteApp.Application.Notes.Commands.CreateNote;

public record CreateNoteCommand(
    string Title,
    string Body,
    List<string> Tags,
    List<string> TodoItems
) : IRequest<NoteDto>;
