﻿using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations.BeelinaData
{
    /// <inheritdoc />
    public partial class RegisterPurchaseOrderReport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
BEGIN TRY
    IF NOT EXISTS (SELECT 1 FROM [Reports] WHERE [Id] = 12 OR [ReportClass] = 'PurchaseOrderReport')
    BEGIN
        INSERT INTO [Reports] (
            [Id],
            [NameTextIdentifier],
            [DescriptionTextIdentifier],
            [ReportClass],
            [Custom],
            [StoredProcedureName],
            [ModuleId],
            [UserMinimumModulePermission],
            [IsActive],
            [IsDelete],
            [DateCreated],
            [DateUpdated],
            [DateDeleted],
            [DateDeactivated],
            [UserMaximumModulePermission],
            [OnlyAvailableOnBusinessModel],
            [Lock]
        ) VALUES (
            12,
            'PURCHASE_ORDER_REPORT_NAME',
            'PURCHASE_ORDER_REPORT_DESC',
            'PurchaseOrderReport',
            0,
            'Report_Purchase_Orders',
            1,
            2,
            1,
            0,
            GETDATE(),
            '0001-01-01 00:00:00.0000000',
            '0001-01-01 00:00:00.0000000',
            '0001-01-01 00:00:00.0000000',
            3,
            NULL,
            1
        );
    END
END TRY
BEGIN CATCH
    THROW;
END CATCH
");        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DELETE FROM Reports WHERE ReportClass = 'PurchaseOrderReport';");
        }
    }
}
