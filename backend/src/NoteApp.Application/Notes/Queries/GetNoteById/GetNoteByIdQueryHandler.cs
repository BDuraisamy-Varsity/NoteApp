using AutoMapper;
using MediatR;
using NoteApp.Application.DTOs;
using NoteApp.Domain.Interfaces;

namespace NoteApp.Application.Notes.Queries.GetNoteById;

public class GetNoteByIdQueryHandler : IRequestHandler<GetNoteByIdQuery, NoteDto?>
{
    private readonly INoteRepository _repository;
    private readonly IMapper _mapper;

    public GetNoteByIdQueryHandler(INoteRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<NoteDto?> Handle(GetNoteByIdQuery request, CancellationToken cancellationToken)
    {
        var note = await _repository.GetByIdAsync(request.Id, cancellationToken);
        return note is null ? null : _mapper.Map<NoteDto>(note);
    }
}
