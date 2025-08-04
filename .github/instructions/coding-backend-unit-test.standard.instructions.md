---
applyTo: "Beelina.UnitTest/**"
---

## Beelina.UnitTest

**Purpose:**  
C# unit and integration test suite for Beelina’s server-side business logic. Focuses on inventory, transactions, products, user roles, and critical domain features.

**Tech Stack:**

- .NET 8.0
- xUnit, Moq (mocking)
- EF Core InMemory/Sqlite (for test DBs)
- coverlet (code coverage)

**Repository Structure:**

- `Beelina.UnitTest.csproj` (project file)
- Test files: product, transaction, withdrawal, warehouse, validation logic
- `BeelinaBaseTest.cs`: test fixture & seeded data

**Testing Patterns:**

- xUnit `[Fact]` attributes, async tests
- Mocking with Moq
- SQLite and EF Core InMemory for isolated DBs
- Seeded sample data for reproducible tests
- Coverage via coverlet

**Guidelines:**

- All new business logic should have corresponding unit tests
- Use mock objects for external service dependencies
- Prefer table-driven and scenario-based tests
- Seed realistic data for integration-like scenarios
- Run tests before every commit: `dotnet test`
- Ensure >90% coverage for core business logic
- Keep test setup modular
