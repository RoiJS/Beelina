using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations.BeelinaData
{
    public partial class IntroducedLabelIdentifierColumnOnTableReportControls : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LabelIdentifier",
                table: "ReportControls",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LabelIdentifier",
                table: "ReportControls");
        }
    }
}
