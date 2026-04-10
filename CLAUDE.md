# NoteApp — AI Learning Journey (Days 1–5)

## Project Overview
A Note-Taking App built progressively over 5 days exploring AI-assisted development — from basic CRUD on Day 1 to full agentic Claude workflows on Day 5. The app follows Clean Architecture, CQRS, Microservices, and WCAG 2.2 accessibility standards.

**GitHub:** https://github.com/BDuraisamy-Varsity/NoteApp

---

## Tech Stack

### Frontend
| Layer           | Technology |
|-----------------|-----------|
| Framework       | React Native (TypeScript) |
| UI/Design       | Figma MCP (WCAG 2.2 compliant designs) |
| Theming         | React Native Paper + custom ThemeContext |
| Accessibility   | WCAG 2.2 AA — contrast, font scaling, screen reader support |
| Responsive      | Dimensions API + useWindowDimensions hook |
| Font Scaling    | Dynamic font size via AccessibilityContext |
| Navigation      | React Navigation v6 |
| State           | React Context + useReducer (Day 1–3), Claude agentic (Day 5) |
| Testing         | Jest + React Native Testing Library |

### Backend
| Layer           | Technology |
|-----------------|-----------|
| Framework       | C# ASP.NET Core 10 Web API |
| Architecture    | Clean Architecture (Domain / Application / Infrastructure / API) |
| Pattern         | CQRS via MediatR |
| Mapping         | AutoMapper |
| ORM             | Entity Framework Core 10 |
| Database        | SQLite (in-memory dev → file-based for persistence) |
| Resilience      | Polly (retry, circuit breaker, timeout) |
| API Docs        | Swagger / OpenAPI 3.0 with versioning |
| API Versioning  | Asp.Versioning.Http |
| Logging         | Serilog with structured logs, correlation IDs |
| Security        | AES-256 encryption for PII fields |
| Testing         | xUnit + Moq + FluentAssertions |
| Coverage        | Coverlet + ReportGenerator |
| Migrations      | EF Core Migrations (auto-generated on model change) |

---

## User Stories
| ID   | Feature       | Story |
|------|---------------|-------|
| US-1 | Create note   | As a user, I can create a new note with a title and body |
| US-2 | Edit & Delete | As a user, I can update or delete any existing note |
| US-3 | List notes    | As a user, I can see a list of all my notes |
| US-4 | Search        | As a user, I can search notes by keyword |
| US-5 | Tags          | As a user, I can add tags to a note and filter by tag |
| US-6 | Persistence   | As a user, my notes are saved across app restarts |
| US-7 | Export        | As a user, I can export a note as plain text or PDF |
| US-8 | To-Do in note | As a user, I can add a checklist/to-do list inside a note |

---

## Day-by-Day AI Progression
- **Day 1** — AI-assisted coding: CRUD API (Clean Arch scaffold) + React Native screens
- **Day 2** — AI suggestions: Search + Tags + Figma UI integration
- **Day 3** — AI patterns: Persistence + Export + Resilience (Polly)
- **Day 4** — Tool use / function calling: To-Do + AI tag suggestions + summarization
- **Day 5** — Full agentic workflow: Claude as agent managing notes end-to-end

---

## Clean Architecture — Project Structure
```
NoteApp/
├── CLAUDE.md
├── README.md
├── .gitignore
│
├── backend/
│   ├── NoteApp.sln
│   │
│   ├── src/
│   │   ├── NoteApp.Domain/               # Entities, Value Objects, Domain Events
│   │   │   ├── Entities/
│   │   │   │   ├── Note.cs
│   │   │   │   ├── Tag.cs
│   │   │   │   └── TodoItem.cs
│   │   │   ├── Events/
│   │   │   └── Interfaces/
│   │   │       └── INoteRepository.cs
│   │   │
│   │   ├── NoteApp.Application/          # CQRS Commands/Queries, MediatR, AutoMapper
│   │   │   ├── Notes/
│   │   │   │   ├── Commands/
│   │   │   │   │   ├── CreateNote/
│   │   │   │   │   │   ├── CreateNoteCommand.cs
│   │   │   │   │   │   └── CreateNoteCommandHandler.cs
│   │   │   │   │   ├── UpdateNote/
│   │   │   │   │   └── DeleteNote/
│   │   │   │   └── Queries/
│   │   │   │       ├── GetAllNotes/
│   │   │   │       │   ├── GetAllNotesQuery.cs
│   │   │   │       │   └── GetAllNotesQueryHandler.cs
│   │   │   │       ├── GetNoteById/
│   │   │   │       └── SearchNotes/
│   │   │   ├── DTOs/
│   │   │   │   ├── NoteDto.cs
│   │   │   │   └── CreateNoteRequest.cs
│   │   │   ├── Mappings/
│   │   │   │   └── NoteProfile.cs        # AutoMapper profiles
│   │   │   └── Behaviors/
│   │   │       ├── LoggingBehavior.cs    # MediatR pipeline logging
│   │   │       └── ValidationBehavior.cs
│   │   │
│   │   ├── NoteApp.Infrastructure/       # EF Core, Repos, Migrations, Encryption
│   │   │   ├── Data/
│   │   │   │   ├── NoteDbContext.cs
│   │   │   │   └── Repositories/
│   │   │   │       └── NoteRepository.cs
│   │   │   ├── Migrations/               # Auto-generated on model change
│   │   │   ├── Security/
│   │   │   │   └── PiiEncryptionService.cs
│   │   │   └── Resilience/
│   │   │       └── ResiliencePolicies.cs # Polly policies
│   │   │
│   │   └── NoteApp.API/                  # Controllers, Middleware, Swagger, DI
│   │       ├── Program.cs
│   │       ├── Controllers/
│   │       │   └── v1/
│   │       │       └── NotesController.cs
│   │       ├── Middleware/
│   │       │   ├── CorrelationIdMiddleware.cs
│   │       │   ├── ExceptionHandlingMiddleware.cs
│   │       │   └── RequestLoggingMiddleware.cs
│   │       └── Configuration/
│   │           ├── SwaggerConfig.cs
│   │           └── DependencyInjection.cs
│   │
│   └── tests/
│       ├── NoteApp.UnitTests/
│       │   ├── Notes/
│       │   │   ├── CreateNoteCommandHandlerTests.cs
│       │   │   └── GetAllNotesQueryHandlerTests.cs
│       │   └── NoteApp.UnitTests.csproj
│       └── NoteApp.IntegrationTests/
│           ├── NotesApiTests.cs
│           └── NoteApp.IntegrationTests.csproj
│
└── frontend/
    └── NoteAppMobile/
        ├── package.json
        ├── tsconfig.json
        ├── App.tsx
        └── src/
            ├── contexts/
            │   ├── ThemeContext.tsx       # Light/dark/custom theme
            │   └── AccessibilityContext.tsx # Font size, contrast
            ├── screens/
            │   ├── HomeScreen.tsx
            │   ├── NoteDetailScreen.tsx
            │   └── EditNoteScreen.tsx
            ├── components/
            │   ├── NoteCard.tsx
            │   ├── TodoList.tsx
            │   └── TagChip.tsx
            ├── theme/
            │   ├── colors.ts
            │   ├── typography.ts         # Scalable font system
            │   └── spacing.ts
            └── services/
                └── api.ts
```

---

## API Versioning & Endpoints (v1)
| Method | Route                              | Description         |
|--------|------------------------------------|---------------------|
| GET    | /api/v1/notes                      | List all notes      |
| GET    | /api/v1/notes/{id}                 | Get note by ID      |
| POST   | /api/v1/notes                      | Create note         |
| PUT    | /api/v1/notes/{id}                 | Update note         |
| DELETE | /api/v1/notes/{id}                 | Delete note         |
| GET    | /api/v1/notes/search?q={query}     | Search by keyword   |
| GET    | /api/v1/notes/tags/{tag}           | Filter by tag       |
| GET    | /api/v1/notes/{id}/export?format=  | Export (txt/pdf)    |

Swagger UI: `https://localhost:5001/swagger`

---

## Middleware Pipeline (order matters)
```
Request
  → CorrelationIdMiddleware       (attach/generate X-Correlation-ID)
  → RequestLoggingMiddleware      (log method, path, correlation ID, duration)
  → ExceptionHandlingMiddleware   (catch all, return ProblemDetails RFC 7807)
  → Authentication (future)
  → Authorization (future)
  → Controllers
```

---

## MCP Servers

### Active in This Project
| MCP Server          | Purpose |
|---------------------|---------|
| `figma-mcp`         | Read Figma designs, extract components, ensure WCAG 2.2 compliance |
| `mcp__csharp__*`    | C# language server — diagnostics, completions, hover, rename, symbols |
| `mcp__git__*`       | Git operations — status, diff, commit, branch |
| `mcp__filesystem__*`| File system — read, write, tree, search |
| `mcp__azure-devops__*` | Pipelines, work items, repos, PRs |

### Figma MCP Usage
- Use `figma-mcp` to pull component specs before building screens
- Verify color contrast ratios meet WCAG 2.2 AA (≥4.5:1 text, ≥3:1 UI components)
- Extract spacing tokens and typography scale for `theme/` folder
- Validate designs against WCAG 2.2 criteria (SC 1.4.3, 1.4.11, 2.5.3, 2.5.8)

---

## Skills to Use

| Skill | When to Use |
|-------|-------------|
| `/claude-api` | Days 4–5: integrating Anthropic SDK for AI features |
| `/simplify` | After each day: review changed code for quality/efficiency |
| `/update-config` | Configure hooks for auto-review on git commit |

---

## Automated Git Commit Workflow (Claude Hooks)
On every `git commit`, Claude must automatically:
1. **Run diagnostics** via `mcp__csharp__csharp_diagnostics` — fix any errors/warnings
2. **Check naming conventions** — PascalCase classes/methods, camelCase locals, `I` prefix for interfaces
3. **Run tests + coverage** — `dotnet test --collect:"XPlat Code Coverage"` — must pass, coverage ≥ 80%
4. **Review code quality** — readability, SRP, DI, loose coupling, complex logic extracted to methods
5. **Security scan** — check for hardcoded secrets, unencrypted PII, SQL injection, OWASP Top 10
6. **Generate DB migration** — `dotnet ef migrations add <DescriptiveName>_<timestamp>` if models changed
7. **Optimize** — flag N+1 queries, unnecessary allocations, sync-over-async
8. **Fix and re-commit** if errors found, then push

---

## C# Coding Standards (ENFORCE ON EVERY FILE)

### Single Responsibility Principle
- Each class has ONE reason to change
- Controllers only handle HTTP — delegate all logic to services/handlers
- Handlers only contain business logic — no DB calls directly
- Repositories only handle data access

### Readability
- Maximum method length: **20 lines** — extract longer logic into descriptive private methods
- No magic numbers — use named constants or configuration
- Method names describe intent: `GetActiveNotesByTag()` not `GetNotes2()`
- No abbreviations in public members: `CreateNoteCommand` not `CrtNoteCmd`

### Dependency Injection (Loose Coupling)
- All dependencies injected via constructor
- Always inject interfaces, never concrete types
- Register in `DependencyInjection.cs` extension methods, not in `Program.cs`
- No `new` keyword for services — use DI container

### Async/Await
- All I/O operations must be async: `async Task<T>`, never `.Result` or `.Wait()`
- Use `CancellationToken` in all async public methods
- Suffix async methods with `Async`: `GetNoteByIdAsync()`

### Example: Correct Pattern
```csharp
// GOOD — SRP, DI, async, descriptive naming
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
        var note = BuildNoteFromRequest(request);
        await _repository.AddAsync(note, cancellationToken);
        _logger.LogInformation("Note created. NoteId={NoteId} CorrelationId={CorrelationId}", 
            note.Id, request.CorrelationId);
        return _mapper.Map<NoteDto>(note);
    }

    private static Note BuildNoteFromRequest(CreateNoteCommand request)
        => new() { Title = request.Title, Body = request.Body, CreatedAt = DateTime.UtcNow };
}
```

---

## Logging Standards
- Use **Serilog** with structured logging (not string interpolation)
- Every log entry must include `CorrelationId` from `ICorrelationIdService`
- Log levels: `Debug` (entry/exit), `Information` (business events), `Warning` (recoverable issues), `Error` (exceptions)
- PII fields (email, name, phone) must be **encrypted** before logging using `IPiiEncryptionService`
- Log format: `[{Timestamp}] [{Level}] [{CorrelationId}] {Message} {Properties}`

```csharp
// CORRECT — structured, no PII in plaintext
_logger.LogInformation(
    "Note updated. NoteId={NoteId}, UserId={UserId}, CorrelationId={CorrelationId}",
    note.Id, _piiService.Encrypt(userId), correlationId);

// WRONG — string interpolation, PII exposed
_logger.LogInformation($"Note updated for user {userEmail}");
```

---

## Security Standards
- PII fields (user data) encrypted at rest using `PiiEncryptionService` (AES-256)
- No connection strings or API keys in code — use `appsettings.json` + environment variables
- All inputs validated via FluentValidation in `ValidationBehavior` MediatR pipeline
- Correlation ID on every request — generated if not present in `X-Correlation-ID` header
- HTTPS enforced in all environments

---

## Database Migration Rules
- On **every model change**, generate a migration immediately:
  ```bash
  cd backend
  dotnet ef migrations add <FeatureName>_<YYYYMMDD> --project src/NoteApp.Infrastructure --startup-project src/NoteApp.API
  ```
- Migration file naming: `CreateNotesTable_20250110`, `AddTagsToNotes_20250111`
- Never modify existing migrations — always add new ones
- Migration scripts stored in `NoteApp.Infrastructure/Migrations/`

---

## Testing Standards
- **Coverage target: ≥ 80%** on all handlers, services, and repositories
- Test naming: `MethodName_StateUnderTest_ExpectedBehavior`
  - Example: `Handle_ValidCommand_ReturnsCreatedNoteDto`
- Use **Arrange-Act-Assert** pattern with clear section comments
- Mock dependencies with **Moq**, assertions with **FluentAssertions**
- Run after every change:
  ```bash
  dotnet test --collect:"XPlat Code Coverage" --results-directory ./coverage
  reportgenerator -reports:coverage/**/coverage.cobertura.xml -targetdir:coverage/report
  ```

---

## Resilience (Polly)
Apply to all external calls (DB, HTTP clients):
- **Retry**: 3 attempts, exponential backoff (1s, 2s, 4s)
- **Circuit Breaker**: open after 5 failures in 30s, reset after 60s
- **Timeout**: 10s per operation
- Configured centrally in `ResiliencePolicies.cs`, injected via DI

---

## UI / Accessibility Standards (WCAG 2.2)
- **Color contrast**: ≥ 4.5:1 for normal text, ≥ 3:1 for large text and UI components (SC 1.4.3, 1.4.11)
- **Font size**: Minimum 16sp base, scalable via `AccessibilityContext` (small/medium/large/xl)
- **Touch targets**: Minimum 44×44dp (SC 2.5.8)
- **Screen reader**: All interactive elements have `accessibilityLabel` and `accessibilityRole`
- **Theme support**: Light / Dark / High Contrast — stored in AsyncStorage
- **Responsive**: Use `useWindowDimensions()` for phone/tablet layouts, never hardcode dimensions

---

## Running the Project

### Backend
```bash
cd backend/NoteApp.API
dotnet run
# API:     https://localhost:5001
# Swagger: https://localhost:5001/swagger
```

### Tests + Coverage
```bash
cd backend
dotnet test --collect:"XPlat Code Coverage"
```

### Frontend
```bash
cd frontend/NoteAppMobile
npm install
npx react-native start
```

---

## Git Commit Convention
Format: `<type>(<scope>): <description>`

| Type | Usage |
|------|-------|
| `feat` | New feature |
| `fix` | Bug fix |
| `test` | Test additions/changes |
| `refactor` | Code restructure (no behavior change) |
| `docs` | Documentation only |
| `chore` | Build, config, migration |
| `security` | Security fix |

Examples:
- `feat(notes): add create note command handler`
- `chore(db): add migration CreateNotesTable_20250110`
- `test(notes): add unit tests for CreateNoteCommandHandler`
