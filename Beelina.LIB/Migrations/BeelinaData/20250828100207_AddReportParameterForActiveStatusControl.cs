using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations.BeelinaData
{
    /// <inheritdoc />
    public partial class AddReportParameterForActiveStatusControl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
-- (1) Add Report Control
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
    , LabelIdentifier
)
SELECT 
	11
	,'ActiveStatusDropdown'
	, 'mainPageContainer'
	, ''
	, 1
	, 0
	, GETDATE()
	, '0001-01-01 00:00:00.0000000'
	, '0001-01-01 00:00:00.0000000'
	, '0001-01-01 00:00:00.0000000'
	, 'REPORT_DETAILS_PAGE.CONTROL_INFORMATION.ACTIVE_STATUS_CONTROL.LABEL'
SET IDENTITY_INSERT ReportControls OFF

-- (2) Add Report Parameter
INSERT INTO ReportParameters (
    ReportControlId,
    Name,
    DataType,
    IsActive,
    IsDelete,
    DateCreated,
    DateUpdated,
    DateDeleted,
    DateDeactivated
)
VALUES (
    11,
    'activeStatus',
    'int',
    1,
    0,
    SYSDATETIME(),
    '0001-01-01T00:00:00.0000000',
    '0001-01-01T00:00:00.0000000',
    '0001-01-01T00:00:00.0000000'
);
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DELETE FROM ReportParameters WHERE ReportControlId = 11;");
        }
    }
}
