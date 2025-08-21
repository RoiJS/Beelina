﻿using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations.BeelinaData
{
    /// <inheritdoc />
    public partial class AddPurchaseOrderReportControlRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
DECLARE @PurchaseOrderReportId AS INT = (SELECT Id FROM Reports WHERE ReportClass = 'PurchaseOrderReport')

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
-- Date From Control (assuming ControlId 3 is From Date)
(@PurchaseOrderReportId, 3, 1, '', 1, 0, GETDATE(), '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000'),
-- Date To Control (assuming ControlId 4 is To Date)
(@PurchaseOrderReportId, 4, 2, '', 1, 0, GETDATE(), '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000');
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
DECLARE @PurchaseOrderReportId INT = (SELECT Id FROM Reports WHERE ReportClass = 'PurchaseOrderReport');
IF @PurchaseOrderReportId IS NOT NULL
BEGIN
    DELETE FROM ReportControlsRelations
    WHERE ReportId = @PurchaseOrderReportId
      AND ReportControlId IN (3, 4);
END
");        }
    }
}
