using AutoMapper;
using MediatR;
using Microsoft.Extensions.Logging;
using NoteApp.Application.DTOs;
using NoteApp.Domain.Entities;
using NoteApp.Domain.Interfaces;

namespace NoteApp.Application.Notes.Commands.CreateNote;

public class CreateNoteCommandHandler : IRequestHandler<CreateNoteCommand, NoteDto>
{
    private readonly INoteRepository _repository;
    private readonly IMapper _mapper;
    private readonly ILogger<CreateNoteCommandHandler> _logger;

    public CreateNoteCommandHandler(
        INoteRepository repository,
        IMapper mapper,
        ILogger<CreateNoteCommandHandler> logger)
    {
        _repository = repository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<NoteDto> Handle(CreateNoteCommand request, CancellationToken cancellationToken)
    {
        var note = BuildNote(request);
        await _repository.AddAsync(note, cancellationToken);

        _logger.LogInformation("Note created. NoteId={NoteId}", note.Id);

        return _mapper.Map<NoteDto>(note);
    }

    private static Note BuildNote(CreateNoteCommand request)
    {
        var note = new Note
        {
            Title = request.Title,
            Body = request.Body,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        AddTagsToNote(note, request.Tags);
        AddTodoItemsToNote(note, request.TodoItems);

        return note;
    }

    private static void AddTagsToNote(Note note, List<string> tagNames)
    {
        foreach (var tagName in tagNames.Where(t => !string.IsNullOrWhiteSpace(t)))
        {
            var tag = new Tag { Name = tagName.Trim().ToLowerInvariant() };
            note.NoteTags.Add(new NoteTag { Note = note, Tag = tag });
        }
    }

    private static void AddTodoItemsToNote(Note note, List<string> todoTexts)
    {
        for (int i = 0; i < todoTexts.Count; i++)
        {
            if (!string.IsNullOrWhiteSpace(todoTexts[i]))
            {
                note.TodoItems.Add(new TodoItem { Text = todoTexts[i], Order = i });
            }
        }
    }
}
