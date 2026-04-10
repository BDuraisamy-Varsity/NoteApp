using AutoMapper;
using FluentAssertions;
using Moq;
using NoteApp.Application.DTOs;
using NoteApp.Application.Notes.Queries.GetAllNotes;
using NoteApp.Domain.Entities;
using NoteApp.Domain.Interfaces;

namespace NoteApp.UnitTests.Notes;

public class GetAllNotesQueryHandlerTests
{
    private readonly Mock<INoteRepository> _repositoryMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly GetAllNotesQueryHandler _handler;

    public GetAllNotesQueryHandlerTests()
    {
        _repositoryMock = new Mock<INoteRepository>();
        _mapperMock = new Mock<IMapper>();
        _handler = new GetAllNotesQueryHandler(_repositoryMock.Object, _mapperMock.Object);
    }

    [Fact]
    public async Task Handle_WhenNotesExist_ReturnsAllNotes()
    {
        // Arrange
        var notes = new List<Note>
        {
            new() { Id = Guid.NewGuid(), Title = "Note 1", Body = "Body 1" },
            new() { Id = Guid.NewGuid(), Title = "Note 2", Body = "Body 2" }
        };
        var noteDtos = notes.Select(n => new NoteDto { Id = n.Id, Title = n.Title }).ToList();

        _repositoryMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(notes);
        _mapperMock.Setup(m => m.Map<IEnumerable<NoteDto>>(notes)).Returns(noteDtos);

        // Act
        var result = await _handler.Handle(new GetAllNotesQuery(), CancellationToken.None);

        // Assert
        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task Handle_WhenNoNotes_ReturnsEmptyList()
    {
        // Arrange
        _repositoryMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([]);
        _mapperMock.Setup(m => m.Map<IEnumerable<NoteDto>>(It.IsAny<IEnumerable<Note>>())).Returns([]);

        // Act
        var result = await _handler.Handle(new GetAllNotesQuery(), CancellationToken.None);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_Always_CallsRepositoryGetAllAsync()
    {
        // Arrange
        _repositoryMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([]);
        _mapperMock.Setup(m => m.Map<IEnumerable<NoteDto>>(It.IsAny<IEnumerable<Note>>())).Returns([]);

        // Act
        await _handler.Handle(new GetAllNotesQuery(), CancellationToken.None);

        // Assert
        _repositoryMock.Verify(r => r.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
