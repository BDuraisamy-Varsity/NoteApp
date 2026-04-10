using MediatR;
using NoteApp.Application.DTOs;
using NoteApp.Domain.Entities;

namespace NoteApp.Application.Notes.Commands.CreateNote;

public record CreateNoteCommand(
    string Title,
    string Body,
    FlagLevel Flag,
    List<string> Tags,
    List<string> TodoItems
) : IRequest<NoteDto>;
