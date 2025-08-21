using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations.BeelinaData
{
    /// <inheritdoc />
    public partial class IntroducePurchaseOrderReferenceNoAutocompleteReportControl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
SET IDENTITY_INSERT ReportControls ON

INSERT INTO ReportControls (
	Id
	, LabelIdentifier
	, Name
	, ParentContainerName
	, IsActive
	, IsDelete
	, DateCreated
	, DateUpdated
	, DateDeleted
	, DateDeactivated
)
SELECT 
	9
	, 'REPORT_DETAILS_PAGE.CONTROL_INFORMATION.PURCHASE_ORDER_REFERENCE_NO_AUTOCOMPLETE_CONTROL.LABEL'
	, 'PurchaseOrderReferenceNoAutocomplete'
	, 'mainPageContainer'
	, 1
	, 0
	, GETDATE()
	, '0001-01-01 00:00:00.0000000'
	, '0001-01-01 00:00:00.0000000'
	, '0001-01-01 00:00:00.0000000'

SET IDENTITY_INSERT ReportControls OFF
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DELETE FROM ReportControls WHERE Id = 9;");
        }
    }
}
