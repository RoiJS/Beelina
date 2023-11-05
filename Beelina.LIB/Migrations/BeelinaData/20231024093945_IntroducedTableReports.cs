using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations.BeelinaData
{
    public partial class IntroducedTableReports : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Reports",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NameTextIdentifier = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DescriptionTextIdentifier = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ReportClass = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Custom = table.Column<bool>(type: "bit", nullable: false),
                    StoredProcedureName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ModuleId = table.Column<int>(type: "int", nullable: false),
                    UserMininimumModulePermission = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDelete = table.Column<bool>(type: "bit", nullable: false),
                    DateCreated = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DateUpdated = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DateDeleted = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DateDeactivated = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reports", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Reports");
        }
    }
}
