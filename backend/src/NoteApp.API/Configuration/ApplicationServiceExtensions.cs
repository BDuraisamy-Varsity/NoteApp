using AutoMapper;
using FluentValidation;
using NoteApp.Application.Behaviors;
using NoteApp.Application.Mappings;

namespace NoteApp.API.Configuration;

public static class ApplicationServiceExtensions
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(typeof(NoteProfile).Assembly);
            cfg.AddOpenBehavior(typeof(LoggingBehavior<,>));
            cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
        });

        services.AddValidatorsFromAssembly(typeof(NoteProfile).Assembly);
        RegisterAutoMapper(services);

        return services;
    }

    private static void RegisterAutoMapper(IServiceCollection services)
    {
        services.AddSingleton<IMapper>(_ =>
        {
            var config = new MapperConfiguration(cfg => cfg.AddProfile<NoteProfile>());
            config.AssertConfigurationIsValid();
            return config.CreateMapper();
        });
    }
}
