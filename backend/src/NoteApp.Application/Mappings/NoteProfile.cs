using AutoMapper;
using NoteApp.Application.DTOs;
using NoteApp.Domain.Entities;

namespace NoteApp.Application.Mappings;

public class NoteProfile : Profile
{
    public NoteProfile()
    {
        CreateMap<Note, NoteDto>()
            .ForMember(dest => dest.Tags, opt => opt.MapFrom(src =>
                src.NoteTags.Select(nt => nt.Tag.Name).ToList()));

        CreateMap<TodoItem, TodoItemDto>();
    }
}
