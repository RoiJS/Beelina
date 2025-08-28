using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations.BeelinaData
{
    /// <inheritdoc />
    public partial class RegisterProductsPerSupplierReport : Migration
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
    [Lock],
    [Category]
) VALUES (
    14,
    'PRODUCTS_PER_SUPPLIER_REPORT_NAME',
    'PRODUCTS_PER_SUPPLIER_REPORT_DESC',
    'ProductsPerSupplierReport',
    0,
    'Report_Products_Per_Supplier',
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
    0,
    2
);
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DELETE FROM Reports WHERE ReportClass = 'ProductsPerSupplierReport';");
        }
    }
}
