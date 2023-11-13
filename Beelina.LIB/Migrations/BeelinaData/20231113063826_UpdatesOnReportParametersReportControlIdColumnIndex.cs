using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations.BeelinaData
{
    public partial class UpdatesOnReportParametersReportControlIdColumnIndex : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ReportParameters_ReportControlId",
                table: "ReportParameters");

            migrationBuilder.CreateIndex(
                name: "IX_ReportParameters_ReportControlId",
                table: "ReportParameters",
                column: "ReportControlId",
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ReportParameters_ReportControlId",
                table: "ReportParameters");

            migrationBuilder.CreateIndex(
                name: "IX_ReportParameters_ReportControlId",
                table: "ReportParameters",
                column: "ReportControlId");
        }
    }
}
