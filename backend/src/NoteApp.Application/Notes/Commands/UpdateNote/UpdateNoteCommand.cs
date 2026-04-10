using MediatR;
using NoteApp.Application.DTOs;

namespace NoteApp.Application.Notes.Commands.UpdateNote;

public record UpdateNoteCommand(
    Guid Id,
    string Title,
    string Body,
    List<string> Tags,
    List<TodoItemDto> TodoItems
) : IRequest<NoteDto?>;
