using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations.BeelinaData
{
    /// <inheritdoc />
    public partial class AddProductsPerSupplierReportControlRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
DECLARE @ProductsPerSupplierReportId AS INT = (SELECT Id FROM Reports WHERE ReportClass = 'ProductsPerSupplierReport')

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
-- Supplier Dropdown Control (ControlId 10) - Order 1
(@ProductsPerSupplierReportId, 10, 1, '', 1, 0, GETDATE(), '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000'),

-- Active Status Dropdown Control (ControlId 11) - Order 2
(@ProductsPerSupplierReportId, 11, 2, '1', 1, 0, GETDATE(), '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000');
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
DECLARE @ProductsPerSupplierReportId AS INT = (SELECT Id FROM Reports WHERE ReportClass = 'ProductsPerSupplierReport')
DELETE FROM ReportControlsRelations WHERE ReportId = @ProductsPerSupplierReportId;
");
        }
    }
}
