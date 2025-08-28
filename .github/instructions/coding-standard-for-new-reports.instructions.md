---
applyTo: "Beelina.API/**,Beelina.LIB/**,Beelina.APP/**"
---

## Bizual Reports module

### Overview

The Bizual Reports module is responsible for generating and managing reports within the Bizual application. It leverages the existing data models and business logic to provide insightful analytics and reporting capabilities. 

### Directories

#### Beelina.LIB

- `Models/Reports/` – Contains report classes. Each class defines how the report is structured and the data it includes.
- `Templates/ReportTemplates/` – Contains excel templates for generating reports.

#### Beelina.API

- `Types/Query/ReportsQuery.cs` – API query type for fetching report data.

#### Beelina.APP

- `src/app/reports/controls` – Contains different report filter controls. 
- `src/app/reports/report-details` – Contains report details components. This is where users interact with the report filters and generate reports.
- `src/app/reports/` – Component for displaying list of available reports.


### Coding Guidelines for new reports

- Follow the existing structure in `Models/Reports` for consistency.
- When creating new migration files, ensure that you use the dotnet CLI command `dotnet ef migrations add <migration_name> -c <DbContext> -s ../Beelina.API/` inside the `Beelina.LIB` project so that the migration is properly associated with the correct database context and with designer files.
- Examining existing migration files is crucial for understanding the changes being made.
- Do NOT run the database update command, let me handle that.
- If needed to introduce new report filter control, follow the existing patterns in `src/app/reports/controls`.