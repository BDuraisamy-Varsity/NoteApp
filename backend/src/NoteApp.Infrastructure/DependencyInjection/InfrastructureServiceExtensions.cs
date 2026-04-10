using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NoteApp.Application.AI;
using NoteApp.Domain.Interfaces;
using NoteApp.Infrastructure.AI;
using NoteApp.Infrastructure.Data;
using NoteApp.Infrastructure.Data.Repositories;
using NoteApp.Infrastructure.Security;

namespace NoteApp.Infrastructure.DependencyInjection;

public static class InfrastructureServiceExtensions
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<NoteDbContext>(options =>
            options.UseSqlite(configuration.GetConnectionString("DefaultConnection")
                ?? "Data Source=noteapp.db"));

        services.AddScoped<INoteRepository, NoteRepository>();
        services.AddSingleton<IPiiEncryptionService, PiiEncryptionService>();
        services.AddScoped<IClaudeAIService, ClaudeAIService>();

        return services;
    }
}
