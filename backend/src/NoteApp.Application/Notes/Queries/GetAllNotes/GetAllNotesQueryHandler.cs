using AutoMapper;
using MediatR;
using NoteApp.Application.DTOs;
using NoteApp.Domain.Interfaces;

namespace NoteApp.Application.Notes.Queries.GetAllNotes;

public class GetAllNotesQueryHandler : IRequestHandler<GetAllNotesQuery, IEnumerable<NoteDto>>
{
    private readonly INoteRepository _repository;
    private readonly IMapper _mapper;

    public GetAllNotesQueryHandler(INoteRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<NoteDto>> Handle(GetAllNotesQuery request, CancellationToken cancellationToken)
    {
        var notes = await _repository.GetAllAsync(cancellationToken);
        return _mapper.Map<IEnumerable<NoteDto>>(notes);
    }
}
