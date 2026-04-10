using AutoMapper;
using MediatR;
using Microsoft.Extensions.Logging;
using NoteApp.Application.DTOs;
using NoteApp.Domain.Interfaces;

namespace NoteApp.Application.Notes.Queries.GetNotesByFlag;

public class GetNotesByFlagQueryHandler : IRequestHandler<GetNotesByFlagQuery, IEnumerable<NoteDto>>
{
    private readonly INoteRepository _repository;
    private readonly IMapper _mapper;
    private readonly ILogger<GetNotesByFlagQueryHandler> _logger;

    public GetNotesByFlagQueryHandler(
        INoteRepository repository,
        IMapper mapper,
        ILogger<GetNotesByFlagQueryHandler> logger)
    {
        _repository = repository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<NoteDto>> Handle(GetNotesByFlagQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Querying notes by flag. Flag={Flag}", request.Flag);
        var notes = await _repository.GetByFlagAsync(request.Flag, cancellationToken);
        return _mapper.Map<IEnumerable<NoteDto>>(notes);
    }
}
