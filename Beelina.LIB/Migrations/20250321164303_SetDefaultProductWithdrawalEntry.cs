using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class SetDefaultProductWithdrawalEntry : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                    IF EXISTS (SELECT 1 FROM ProductStockAudits)
                    BEGIN
                        SET IDENTITY_INSERT ProductWithdrawalEntries ON
                        INSERT INTO ProductWithdrawalEntries (
                            Id
                            , StockEntryDate
                            , WithdrawalSlipNo
                            , Notes
                            , DeletedById
                            , UpdatedById
                            , CreatedById
                            , DeactivatedById
                            , IsActive
                            , IsDelete
                            , DateCreated
                            , DateUpdated
                            , DateDeleted
                            , DateDeactivated
                        ) VALUES (
                            1,  GETDATE(), 'PW-0001', '', NULL, NULL, NULL, NULL, 1, 0, '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000'
                        ) 
                        SET IDENTITY_INSERT ProductWithdrawalEntries OFF
                    END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE ProductWithdrawalEntries WHERE Id = 1
            ");
        }
    }
}
