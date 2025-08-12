using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations.BeelinaData
{
    /// <inheritdoc />
    public partial class MakeCustomerDetailedTransactionsReportSalesAgentDropdownReportControlAvailable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE ReportControlsRelations SET OnlyAvailableOnBusinessModel	= '1;3', OnlyAvailableOnBusinessModelForMinimumPrivilege = 2  WHERE ReportId = 8 AND ReportControlId = 5;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE ReportControlsRelations SET OnlyAvailableOnBusinessModel	= NULL, OnlyAvailableOnBusinessModelForMinimumPrivilege = NULL  WHERE ReportId = 8 AND ReportControlId = 5;
            ");
        }
    }
}
