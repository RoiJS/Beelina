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
-- (1) Add Report Parameter
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
