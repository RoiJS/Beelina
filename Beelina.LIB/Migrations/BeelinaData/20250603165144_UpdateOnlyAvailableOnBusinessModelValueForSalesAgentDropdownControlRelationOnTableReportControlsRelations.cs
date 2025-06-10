using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations.BeelinaData
{
    /// <inheritdoc />
    public partial class UpdateOnlyAvailableOnBusinessModelValueForSalesAgentDropdownControlRelationOnTableReportControlsRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE ReportControlsRelations SET OnlyAvailableOnBusinessModel	= '1;3' WHERE ReportId = 4 AND ReportControlId = 5; -- Make sales agent dropdown control available on Business Models 1 and 3
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE ReportControlsRelations SET OnlyAvailableOnBusinessModel	= '1' WHERE ReportId = 4 AND ReportControlId = 5; -- Revert update
            ");
        }
    }
}
