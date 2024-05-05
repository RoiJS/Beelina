using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations.BeelinaData
{
    public partial class IntroduceColumnsOnlyAvailableOnBusinessModelForMinimumPrivilegeAndOnlyAvailableOnBusinessModelOnTableReportControlsRelation : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "OnlyAvailableOnBusinessModel",
                table: "ReportControlsRelations",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "OnlyAvailableOnBusinessModelForMinimumPrivilege",
                table: "ReportControlsRelations",
                type: "int",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OnlyAvailableOnBusinessModel",
                table: "ReportControlsRelations");

            migrationBuilder.DropColumn(
                name: "OnlyAvailableOnBusinessModelForMinimumPrivilege",
                table: "ReportControlsRelations");
        }
    }
}
