namespace NoteApp.Domain.Entities;

/// <summary>
/// Priority flag for a note — ordered from most urgent (Critical) to least (Low).
/// Colors follow a hot-to-cool palette for quick visual scanning.
/// </summary>
public enum FlagLevel
{
    None     = 0,   // No flag        — #94A3B8 (slate grey)
    Low      = 1,   // Cool blue      — #007AFF
    Normal   = 2,   // Green          — #34C759
    Important = 3,  // Amber          — #FFCC00
    High     = 4,   // Orange-red     — #FF6B35
    Critical = 5    // Fire red       — #FF3B30
}
