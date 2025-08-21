﻿using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations.BeelinaData
{
    /// <inheritdoc />
    public partial class AddReportParameterForPurchaseOrderReferenceNoControl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
INSERT INTO ReportParameters (
	ReportControlId
	, Name
	, DataType
	, IsActive
	, IsDelete
	, DateCreated
	, DateUpdated
	, DateDeleted
	, DateDeactivated
)
SELECT 
    9
	, 'purchaseOrderReferenceNo'
	, 'string'
	, 1
	, 0
	, GETDATE()
	, '0001-01-01 00:00:00.0000000'
	, '0001-01-01 00:00:00.0000000'
	, '0001-01-01 00:00:00.0000000'
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DELETE FROM ReportParameters WHERE ReportControlId = 9 AND Name = 'purchaseOrderReferenceNo';");        }
    }
}
