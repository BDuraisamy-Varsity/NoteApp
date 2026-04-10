using MediatR;
using NoteApp.Application.DTOs;

namespace NoteApp.Application.Notes.Queries.GetAllNotes;

public record GetAllNotesQuery : IRequest<IEnumerable<NoteDto>>;
