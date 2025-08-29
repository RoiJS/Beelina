using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations.BeelinaData
{
    /// <inheritdoc />
    public partial class IntroduceActiveStatusDropdownReportControl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
SET IDENTITY_INSERT ReportControls ON

INSERT INTO ReportControls (
    Id,
    LabelIdentifier,
    Name,
    ParentContainerName,
    IsActive,
    IsDelete,
    DateCreated,
    DateUpdated,
    DateDeleted,
    DateDeactivated
)
VALUES (
    11,
    N'REPORT_DETAILS_PAGE.CONTROL_INFORMATION.ACTIVE_STATUS_CONTROL.LABEL',
    N'ActiveStatusDropdown',
    N'mainPageContainer',
    1,
    0,
    SYSDATETIME(),
    '0001-01-01T00:00:00.0000000',
    '0001-01-01T00:00:00.0000000',
    '0001-01-01T00:00:00.0000000'
);

SET IDENTITY_INSERT ReportControls OFF;
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DELETE FROM ReportControls WHERE Id = 11;");
        }
    }
}
