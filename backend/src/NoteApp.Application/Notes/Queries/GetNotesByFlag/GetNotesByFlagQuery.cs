using MediatR;
using NoteApp.Application.DTOs;
using NoteApp.Domain.Entities;

namespace NoteApp.Application.Notes.Queries.GetNotesByFlag;

public record GetNotesByFlagQuery(FlagLevel Flag) : IRequest<IEnumerable<NoteDto>>;
