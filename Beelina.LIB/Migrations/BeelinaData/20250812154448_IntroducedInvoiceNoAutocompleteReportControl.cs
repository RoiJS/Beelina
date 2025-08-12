using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations.BeelinaData
{
    /// <inheritdoc />
    public partial class IntroducedInvoiceNoAutocompleteReportControl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                        @"
SET IDENTITY_INSERT ReportControls ON
INSERT INTO ReportControls(
    Id
    , Name	
    , ParentContainerName	
    , CustomCSSClasses	
    , IsActive	
    , IsDelete	
    , DateCreated	
    , DateUpdated	
    , DateDeleted	
    , DateDeactivated
    ,LabelIdentifier
)
SELECT 
	8
	,'InvoiceNoAutocomplete'
	, 'mainPageContainer'
	, ''
	, 1
	, 0
	, GETDATE()
	, '0001-01-01 00:00:00.0000000'
	, '0001-01-01 00:00:00.0000000'
	, '0001-01-01 00:00:00.0000000'
	, 'REPORT_DETAILS_PAGE.CONTROL_INFORMATION.INVOICE_NO_AUTOCOMPLETE_CONTROL.LABEL'

SET IDENTITY_INSERT ReportControls OFF
                        ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DELETE FROM ReportControls WHERE Id = 8;");
        }
    }
}
