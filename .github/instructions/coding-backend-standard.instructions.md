---
applyTo: "Beelina.API/**,Beelina.LIB/**"
---

## Beelina.API

**Purpose:**  
Beelina.API is a .NET 8 (ASP.NET Core) Web API project responsible for powering the backend of the Beelina multi-tenant SaaS platform. It manages products, user accounts, inventory, sales, and integrates with various services for order processing and reporting.

**Tech Stack:**

- .NET 8.0 (ASP.NET Core Web API)
- AutoMapper, HotChocolate (GraphQL), JWT, Entity Framework Core, NLog, RestSharp, Swashbuckle (Swagger)
- Shared logic from `Beelina.LIB`

**Repository Structure:**

- `.config/` – Custom configs
- `Controllers/` – API controllers
- `Helpers/` – Utilities
- `Middlewares/` – Custom middleware
- `Types/Mutations` – GraphQL Mutation classes
- `Types/Query` – GraphQL Query classes
- `Templates/EmailTemplates/` – Email templates for notifications
- `Templates/ReportTemplates/` – Report templates for generating Excel reports
- `Program.cs`, `Beelina.API.csproj`, `appsettings.json` & variants

**Guidelines:**

- Follow .NET/ASP.NET Core best practices
- Use dependency injection for services
- Format code and run tests before commits
- Document public APIs and complex logic
- Write unit tests for new features

---

## Beelina.LIB

Beelina.LIB is the shared C# library powering business logic, data models, database contexts, and integration utilities for both Beelina.API and Beelina.UnitTest.

### Tech Stack

- **Framework:** .NET 8.0
- **Core Libraries:**
  - **EPPlus** (`7.1.2`): Excel file generation and parsing.
  - **HotChocolate.AspNetCore** (`13.9.0`): GraphQL server and schema support.
  - **Microsoft.EntityFrameworkCore** / **Relational** / **SqlServer** (`8.0.4`): ORM and database connectivity.
  - **RestSharp** (`112.1.0`): HTTP client for external API calls.

### Structure

- `BusinessLogic/` – Core business logic implementations
- `DbContexts/BeelinaClientDataContext.cs` – Entity Framework Core database context for client data
- `DbContexts/BeelinaDataContext.cs` – Entity Framework Core database context for system data
- `Enums/` – Enumeration types used throughout the API
- `Helpers/` – Utility classes and methods
- `Interfaces/` – Service interfaces for dependency injection
- `Migrations/` – Entity Framework Core migrations
- `Models/` – Application specific data models
- `Models/Filters` – Model classes for filtering data
- `Models/Reports` – Report classes for generating Excel reports

- Data models (entities, DTOs)
- Business logic layer
- Database context for Entity Framework Core
- GraphQL types and resolvers
- Shared utilities and helpers

### General Guidelines

- Maintain separation of concerns: models, logic, helpers, contexts.
- Avoid direct API or UI dependencies.
- Keep code reusable and testable.
- Document public APIs and complex logic.
- Follow .NET best practices and code conventions.
- If necessary to adjust something on the database objects (new columns, new Sp, delete columns, rename columns, etc.), Activate the ActivateEFMigration on `Beelina.API/appsettings.json` file to be able to run dotnet migrations cli command.
- Do not run database update, let me run it myself, just add the migrations file by running the `dotnet migrations add <migration_message> -c <Database Context> -s ../Beelina.API/`. Database context: `BeelinaDataContext` or `BeelinaClientDbContext`
