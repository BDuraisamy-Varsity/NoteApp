using Asp.Versioning.ApiExplorer;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace NoteApp.API.Configuration;

public static class SwaggerServiceExtensions
{
    public static IServiceCollection AddSwaggerWithVersioning(this IServiceCollection services)
    {
        services.AddSwaggerGen();
        services.AddTransient<IConfigureOptions<SwaggerGenOptions>, ConfigureSwaggerOptions>();
        return services;
    }

    public static IApplicationBuilder UseSwaggerWithVersioning(
        this IApplicationBuilder app,
        IApiVersionDescriptionProvider provider)
    {
        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            foreach (var description in provider.ApiVersionDescriptions)
            {
                options.SwaggerEndpoint(
                    $"/swagger/{description.GroupName}/swagger.json",
                    $"NoteApp API {description.GroupName.ToUpperInvariant()}");
            }
            options.RoutePrefix = "swagger";
        });

        return app;
    }
}

public class ConfigureSwaggerOptions : IConfigureOptions<SwaggerGenOptions>
{
    private readonly IApiVersionDescriptionProvider _provider;

    public ConfigureSwaggerOptions(IApiVersionDescriptionProvider provider)
    {
        _provider = provider;
    }

    public void Configure(SwaggerGenOptions options)
    {
        foreach (var description in _provider.ApiVersionDescriptions)
        {
            options.SwaggerDoc(description.GroupName, BuildVersionInfo(description));
        }
    }

    private static OpenApiInfo BuildVersionInfo(ApiVersionDescription description)
    {
        var info = new OpenApiInfo
        {
            Title = "NoteApp API",
            Version = description.ApiVersion.ToString(),
            Description = "NoteApp API — AI Learning Journey (Days 1–5)",
            Contact = new OpenApiContact { Name = "NoteApp Team" }
        };

        if (description.IsDeprecated)
            info.Description += " [DEPRECATED]";

        return info;
    }
}
