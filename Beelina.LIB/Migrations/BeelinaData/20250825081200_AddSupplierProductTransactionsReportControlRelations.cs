using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations.BeelinaData
{
    /// <inheritdoc />
    public partial class AddSupplierProductTransactionsReportControlRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
DECLARE @SupplierProductTransactionsReportId AS INT = (SELECT Id FROM Reports WHERE ReportClass = 'SupplierProductTransactionsReport')

INSERT INTO ReportControlsRelations (
    ReportId,
    ReportControlId,
    [Order],
    DefaultValue,
    IsActive,
    IsDelete,
    DateCreated,
    DateUpdated,
    DateDeleted,
    DateDeactivated
) VALUES 
-- Supplier Dropdown Control (ControlId 10)
(@SupplierProductTransactionsReportId, 10, 1, '', 1, 0, GETDATE(), '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000'),
-- Transaction Type Dropdown Control (Order Status - ControlId 6)
(@SupplierProductTransactionsReportId, 6, 2, 'CONFIRMED', 1, 0, GETDATE(), '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000'),
-- Date From Control (ControlId 3)
(@SupplierProductTransactionsReportId, 3, 3, '', 1, 0, GETDATE(), '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000'),
-- Date To Control (ControlId 4)
(@SupplierProductTransactionsReportId, 4, 4, '', 1, 0, GETDATE(), '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000');
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DELETE FROM ReportControlsRelations WHERE ReportId = (SELECT Id FROM Reports WHERE ReportClass = 'SupplierProductTransactionsReport');");
        }
    }
}
