using AutoMapper;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using NoteApp.Application.DTOs;
using NoteApp.Application.Notes.Commands.CreateNote;
using NoteApp.Domain.Entities;
using NoteApp.Domain.Interfaces;

namespace NoteApp.UnitTests.Notes;

public class CreateNoteCommandHandlerTests
{
    private readonly Mock<INoteRepository> _repositoryMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly Mock<ILogger<CreateNoteCommandHandler>> _loggerMock;
    private readonly CreateNoteCommandHandler _handler;

    public CreateNoteCommandHandlerTests()
    {
        _repositoryMock = new Mock<INoteRepository>();
        _mapperMock = new Mock<IMapper>();
        _loggerMock = new Mock<ILogger<CreateNoteCommandHandler>>();
        _handler = new CreateNoteCommandHandler(_repositoryMock.Object, _mapperMock.Object, _loggerMock.Object);
    }

    [Fact]
    public async Task Handle_ValidCommand_ReturnsCreatedNoteDto()
    {
        // Arrange
        var command = new CreateNoteCommand("Test Title", "Test Body", FlagLevel.None, ["work"], ["Buy milk"]);
        var expectedDto = new NoteDto { Id = Guid.NewGuid(), Title = "Test Title", Body = "Test Body" };
        _mapperMock.Setup(m => m.Map<NoteDto>(It.IsAny<Note>())).Returns(expectedDto);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Title.Should().Be("Test Title");
    }

    [Fact]
    public async Task Handle_ValidCommand_CallsRepositoryAddAsync()
    {
        // Arrange
        var command = new CreateNoteCommand("Title", "Body", FlagLevel.None, [], []);
        _mapperMock.Setup(m => m.Map<NoteDto>(It.IsAny<Note>())).Returns(new NoteDto());

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _repositoryMock.Verify(r => r.AddAsync(It.IsAny<Note>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_CommandWithEmptyTitle_StillCallsRepository()
    {
        // Arrange
        var command = new CreateNoteCommand("", "Body", FlagLevel.None, [], []);
        _mapperMock.Setup(m => m.Map<NoteDto>(It.IsAny<Note>())).Returns(new NoteDto());

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _repositoryMock.Verify(r => r.AddAsync(It.Is<Note>(n => n.Title == ""), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_CommandWithTags_BuildsNoteTagsCorrectly()
    {
        // Arrange
        Note? capturedNote = null;
        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Note>(), It.IsAny<CancellationToken>()))
            .Callback<Note, CancellationToken>((note, _) => capturedNote = note);
        _mapperMock.Setup(m => m.Map<NoteDto>(It.IsAny<Note>())).Returns(new NoteDto());

        var command = new CreateNoteCommand("Title", "Body", FlagLevel.High, ["work", "personal"], []);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedNote!.NoteTags.Should().HaveCount(2);
        capturedNote.NoteTags.Select(nt => nt.Tag.Name).Should().Contain("work").And.Contain("personal");
        capturedNote.Flag.Should().Be(FlagLevel.High);
    }
}
