using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations.BeelinaData
{
    /// <inheritdoc />
    public partial class UpdatePurchaseOrderReportControlsOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
-- Update the order of controls for Purchase Order Report (ReportId = 9)
-- New order: Purchase Order Reference No (1), Supplier (2), Date From (3), Date To (4)

UPDATE ReportControlsRelations 
SET [Order] = 1
WHERE ReportId = 12 AND ReportControlId = 9; -- Purchase Order Reference No Control

UPDATE ReportControlsRelations 
SET [Order] = 2  
WHERE ReportId = 12 AND ReportControlId = 10; -- Supplier Control

UPDATE ReportControlsRelations 
SET [Order] = 3
WHERE ReportId = 12 AND ReportControlId = 3; -- Date From Control

UPDATE ReportControlsRelations 
SET [Order] = 4
WHERE ReportId = 12 AND ReportControlId = 4; -- Date To Control
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
-- Revert to original order
UPDATE ReportControlsRelations 
SET [Order] = 1
WHERE ReportId = 12 AND ReportControlId = 3; -- Date From Control

UPDATE ReportControlsRelations 
SET [Order] = 2
WHERE ReportId = 12 AND ReportControlId = 4; -- Date To Control

UPDATE ReportControlsRelations 
SET [Order] = 3
WHERE ReportId = 12 AND ReportControlId = 9; -- Purchase Order Reference No Control

UPDATE ReportControlsRelations 
SET [Order] = 4
WHERE ReportId = 12 AND ReportControlId = 10; -- Supplier Control
");
        }
    }
}
