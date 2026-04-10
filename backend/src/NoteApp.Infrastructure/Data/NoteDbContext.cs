using Microsoft.EntityFrameworkCore;
using NoteApp.Domain.Entities;

namespace NoteApp.Infrastructure.Data;

public class NoteDbContext : DbContext
{
    public NoteDbContext(DbContextOptions<NoteDbContext> options) : base(options) { }

    public DbSet<Note> Notes => Set<Note>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<NoteTag> NoteTags => Set<NoteTag>();
    public DbSet<TodoItem> TodoItems => Set<TodoItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        ConfigureNoteEntity(modelBuilder);
        ConfigureTagEntity(modelBuilder);
        ConfigureNoteTagEntity(modelBuilder);
        ConfigureTodoItemEntity(modelBuilder);
    }

    private static void ConfigureNoteEntity(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Note>(entity =>
        {
            entity.HasKey(n => n.Id);
            entity.Property(n => n.Title).IsRequired().HasMaxLength(200);
            entity.Property(n => n.Body).HasMaxLength(10000);
            entity.HasQueryFilter(n => !n.IsDeleted);
        });
    }

    private static void ConfigureTagEntity(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Tag>(entity =>
        {
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Name).IsRequired().HasMaxLength(50);
            entity.HasIndex(t => t.Name).IsUnique();
        });
    }

    private static void ConfigureNoteTagEntity(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<NoteTag>(entity =>
        {
            entity.HasKey(nt => new { nt.NoteId, nt.TagId });
            entity.HasOne(nt => nt.Note).WithMany(n => n.NoteTags).HasForeignKey(nt => nt.NoteId);
            entity.HasOne(nt => nt.Tag).WithMany(t => t.NoteTags).HasForeignKey(nt => nt.TagId);
        });
    }

    private static void ConfigureTodoItemEntity(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TodoItem>(entity =>
        {
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Text).IsRequired().HasMaxLength(500);
            entity.HasOne(t => t.Note).WithMany(n => n.TodoItems).HasForeignKey(t => t.NoteId);
        });
    }
}
