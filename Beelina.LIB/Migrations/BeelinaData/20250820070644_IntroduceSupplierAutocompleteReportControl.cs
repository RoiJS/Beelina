using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations.BeelinaData
{
    /// <inheritdoc />
    public partial class IntroduceSupplierAutocompleteReportControl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF NOT EXISTS (SELECT 1 FROM ReportControls WHERE Id = 10)
BEGIN
    BEGIN TRY
        SET IDENTITY_INSERT ReportControls ON;

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
            10,
            N'REPORT_DETAILS_PAGE.CONTROL_INFORMATION.SUPPLIER_AUTOCOMPLETE_CONTROL.LABEL',
            N'SupplierAutocomplete',
            N'mainPageContainer',
            1,
            0,
            SYSDATETIME(),
            '0001-01-01T00:00:00.0000000',
            '0001-01-01T00:00:00.0000000',
            '0001-01-01T00:00:00.0000000'
        );

        SET IDENTITY_INSERT ReportControls OFF;
    END TRY
    BEGIN CATCH
        BEGIN TRY
            SET IDENTITY_INSERT ReportControls OFF;
        END TRY
        BEGIN CATCH
        END CATCH
        THROW;
    END CATCH
END
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DELETE FROM ReportControls WHERE Id = 10;");
        }
    }
}
