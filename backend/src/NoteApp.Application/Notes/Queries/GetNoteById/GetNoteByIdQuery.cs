using MediatR;
using NoteApp.Application.DTOs;

namespace NoteApp.Application.Notes.Queries.GetNoteById;

public record GetNoteByIdQuery(Guid Id) : IRequest<NoteDto?>;
