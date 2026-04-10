using MediatR;
using NoteApp.Application.DTOs;

namespace NoteApp.Application.Notes.Queries.SearchNotes;

public record SearchNotesQuery(string Keyword) : IRequest<IEnumerable<NoteDto>>;
