using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations.BeelinaData
{
    /// <inheritdoc />
    public partial class AddSupplierControlToPurchaseOrderReport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
INSERT INTO ReportControlsRelations (
	ReportId
	, ReportControlId
	, [Order]
	, DefaultValue
	, IsActive
	, IsDelete
	, DateCreated
	, DateUpdated
	, DateDeleted
	, DateDeactivated
)
SELECT 
	12
	, 10
	, 4
	, ''
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
            migrationBuilder.Sql(@"DELETE FROM ReportControlsRelations WHERE ReportId = 12 AND ReportControlId = 10;");
        }
    }
}
