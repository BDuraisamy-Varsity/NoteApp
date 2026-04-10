using MediatR;
using NoteApp.Application.DTOs;

namespace NoteApp.Application.Notes.Queries.GetNotesByTag;

public record GetNotesByTagQuery(string TagName) : IRequest<IEnumerable<NoteDto>>;
