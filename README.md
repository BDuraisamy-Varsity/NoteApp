# NoteApp — AI Learning Journey (Days 1–5)

A Note-Taking App built progressively to explore AI-assisted development techniques.

## Quick Start

### Open in VS Code
```
File → Open Workspace from File → NoteApp.code-workspace
```

### Run Backend (http :5000 / https :5001 / Swagger :5001/swagger)
```bash
cd backend
dotnet run --project src/NoteApp.API/NoteApp.API.csproj --launch-profile https
```

### Run Tests
```bash
cd backend
dotnet test NoteApp.sln --collect:"XPlat Code Coverage"
```

### Run Frontend (Metro :8081)
```bash
cd frontend/NoteAppMobile
npm install
npx react-native start --port 8081
```

## Tech Stack
- **Backend**: C# ASP.NET Core 10, Clean Architecture, CQRS + MediatR, AutoMapper, EF Core + SQLite
- **Frontend**: React Native (TypeScript), WCAG 2.2 AA, Theme + Font scaling
- **Testing**: xUnit, Moq, FluentAssertions, coverlet
- **Docs**: Swagger UI at `/swagger`

## Architecture
```
Domain → Application → Infrastructure → API
                                        ↑
                    React Native ───── REST API (v1)
```

See `CLAUDE.md` for full project context, coding standards, and AI progression details.
