using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations.BeelinaData
{
    /// <inheritdoc />
    public partial class RegisterSupplierProductTransactionsReport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
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
    13,
    'SUPPLIER_PRODUCT_TRANSACTIONS_REPORT_NAME',
    'SUPPLIER_PRODUCT_TRANSACTIONS_REPORT_DESC',
    'SupplierProductTransactionsReport',
    0,
    'Report_Supplier_Product_Transactions',
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
");        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DELETE FROM Reports WHERE ReportClass = 'SupplierProductTransactionsReport';");
        }
    }
}
