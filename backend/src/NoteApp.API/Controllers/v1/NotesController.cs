using Asp.Versioning;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using NoteApp.Application.DTOs;
using NoteApp.Application.Notes.Commands.CreateNote;
using NoteApp.Application.Notes.Commands.DeleteNote;
using NoteApp.Application.Notes.Commands.UpdateNote;
using NoteApp.Application.Notes.Queries.GetAllNotes;
using NoteApp.Application.Notes.Queries.GetNoteById;
using NoteApp.Application.Notes.Queries.GetNotesByTag;
using NoteApp.Application.Notes.Queries.GetNotesByFlag;
using NoteApp.Application.Notes.Queries.SearchNotes;
using NoteApp.Domain.Entities;

namespace NoteApp.API.Controllers.v1;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Produces("application/json")]
public class NotesController : ControllerBase
{
    private readonly IMediator _mediator;

    public NotesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>Gets all notes.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<NoteDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var notes = await _mediator.Send(new GetAllNotesQuery(), cancellationToken);
        return Ok(notes);
    }

    /// <summary>Gets a note by ID.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(NoteDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var note = await _mediator.Send(new GetNoteByIdQuery(id), cancellationToken);
        return note is null ? NotFound() : Ok(note);
    }

    /// <summary>Searches notes by keyword.</summary>
    [HttpGet("search")]
    [ProducesResponseType(typeof(IEnumerable<NoteDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Search([FromQuery] string q, CancellationToken cancellationToken)
    {
        var notes = await _mediator.Send(new SearchNotesQuery(q), cancellationToken);
        return Ok(notes);
    }

    /// <summary>Gets notes filtered by tag.</summary>
    [HttpGet("tags/{tagName}")]
    [ProducesResponseType(typeof(IEnumerable<NoteDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByTag(string tagName, CancellationToken cancellationToken)
    {
        var notes = await _mediator.Send(new GetNotesByTagQuery(tagName), cancellationToken);
        return Ok(notes);
    }

    /// <summary>Gets notes filtered by flag/priority level.</summary>
    [HttpGet("flags/{flag}")]
    [ProducesResponseType(typeof(IEnumerable<NoteDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByFlag(FlagLevel flag, CancellationToken cancellationToken)
    {
        var notes = await _mediator.Send(new GetNotesByFlagQuery(flag), cancellationToken);
        return Ok(notes);
    }

    /// <summary>Creates a new note.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(NoteDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateNoteCommand command, CancellationToken cancellationToken)
    {
        var note = await _mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = note.Id }, note);
    }

    /// <summary>Updates an existing note.</summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(NoteDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateNoteCommand command, CancellationToken cancellationToken)
    {
        var note = await _mediator.Send(command with { Id = id }, cancellationToken);
        return note is null ? NotFound() : Ok(note);
    }

    /// <summary>Deletes a note by ID.</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await _mediator.Send(new DeleteNoteCommand(id), cancellationToken);
        return deleted ? NoContent() : NotFound();
    }

    /// <summary>Exports a note as plain text.</summary>
    [HttpGet("{id:guid}/export")]
    [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Export(Guid id, [FromQuery] string format = "txt", CancellationToken cancellationToken = default)
    {
        var note = await _mediator.Send(new GetNoteByIdQuery(id), cancellationToken);
        if (note is null) return NotFound();

        var content = BuildExportContent(note);
        return File(System.Text.Encoding.UTF8.GetBytes(content), "text/plain", $"{note.Title}.txt");
    }

    private static string BuildExportContent(NoteDto note)
    {
        var lines = new List<string>
        {
            $"Title: {note.Title}",
            $"Created: {note.CreatedAt:yyyy-MM-dd HH:mm:ss}",
            $"Tags: {string.Join(", ", note.Tags)}",
            string.Empty,
            note.Body
        };

        if (note.TodoItems.Any())
        {
            lines.Add(string.Empty);
            lines.Add("To-Do:");
            lines.AddRange(note.TodoItems
                .OrderBy(t => t.Order)
                .Select(t => $"  [{(t.IsCompleted ? "x" : " ")}] {t.Text}"));
        }

        return string.Join(Environment.NewLine, lines);
    }
}
