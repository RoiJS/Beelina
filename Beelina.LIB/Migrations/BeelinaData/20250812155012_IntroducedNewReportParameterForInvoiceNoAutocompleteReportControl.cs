using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations.BeelinaData
{
    /// <inheritdoc />
    public partial class IntroducedNewReportParameterForInvoiceNoAutocompleteReportControl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
INSERT INTO ReportParameters (
	Name
	, ReportControlId
	, DataType
	, IsActive
	, IsDelete
	, DateCreated
	, DateUpdated
	, DateDeleted
	, DateDeactivated
)
SELECT 
	'invoiceNo'
	, 8
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
            migrationBuilder.Sql(@"DELETE FROM ReportParameters WHERE Name = 'invoiceNo' AND ReportControlId = 8;");
        }
    }
}
