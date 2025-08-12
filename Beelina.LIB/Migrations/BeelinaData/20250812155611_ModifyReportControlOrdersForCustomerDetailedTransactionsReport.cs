using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations.BeelinaData
{
    /// <inheritdoc />
    public partial class ModifyReportControlOrdersForCustomerDetailedTransactionsReport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE ReportControlsRelations SET [Order] = 0 WHERE ReportId = 8 AND ReportControlId = 5;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE ReportControlsRelations SET [Order] = 1 WHERE ReportId = 8 AND ReportControlId = 5;
            ");
        }
    }
}
