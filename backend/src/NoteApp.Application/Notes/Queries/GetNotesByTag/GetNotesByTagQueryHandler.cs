using AutoMapper;
using MediatR;
using NoteApp.Application.DTOs;
using NoteApp.Domain.Interfaces;

namespace NoteApp.Application.Notes.Queries.GetNotesByTag;

public class GetNotesByTagQueryHandler : IRequestHandler<GetNotesByTagQuery, IEnumerable<NoteDto>>
{
    private readonly INoteRepository _repository;
    private readonly IMapper _mapper;

    public GetNotesByTagQueryHandler(INoteRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<NoteDto>> Handle(GetNotesByTagQuery request, CancellationToken cancellationToken)
    {
        var notes = await _repository.GetByTagAsync(request.TagName, cancellationToken);
        return _mapper.Map<IEnumerable<NoteDto>>(notes);
    }
}
