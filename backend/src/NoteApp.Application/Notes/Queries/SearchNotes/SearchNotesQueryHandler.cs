using AutoMapper;
using MediatR;
using NoteApp.Application.DTOs;
using NoteApp.Domain.Interfaces;

namespace NoteApp.Application.Notes.Queries.SearchNotes;

public class SearchNotesQueryHandler : IRequestHandler<SearchNotesQuery, IEnumerable<NoteDto>>
{
    private readonly INoteRepository _repository;
    private readonly IMapper _mapper;

    public SearchNotesQueryHandler(INoteRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<NoteDto>> Handle(SearchNotesQuery request, CancellationToken cancellationToken)
    {
        var notes = await _repository.SearchAsync(request.Keyword, cancellationToken);
        return _mapper.Map<IEnumerable<NoteDto>>(notes);
    }
}
