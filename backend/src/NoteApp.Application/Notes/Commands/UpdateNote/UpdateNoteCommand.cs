using MediatR;
using NoteApp.Application.DTOs;
using NoteApp.Domain.Entities;

namespace NoteApp.Application.Notes.Commands.UpdateNote;

public record UpdateNoteCommand(
    Guid Id,
    string Title,
    string Body,
    FlagLevel Flag,
    List<string> Tags,
    List<TodoItemDto> TodoItems
) : IRequest<NoteDto?>;
