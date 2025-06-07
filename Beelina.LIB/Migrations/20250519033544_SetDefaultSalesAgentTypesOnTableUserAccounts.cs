using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Migrations.Internal;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class SetDefaultSalesAgentTypesOnTableUserAccounts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                -- Update UserAccounts.SalesAgentTypeEnum based on UserPermission conditions
                BEGIN TRANSACTION;

                BEGIN TRY
                    UPDATE UA
                    SET UA.SalesAgentTypeEnum = 
                        CASE 
                            WHEN UP.ModuleId = 1 AND UP.PermissionLevel = 1 THEN 1  -- Sales Agent = Field Agent
                            ELSE 0                                                  -- Sales Agent = None
                        END
                    FROM UserAccounts UA
                    LEFT JOIN UserPermission UP ON UA.Id = UP.UserAccountId;

                    COMMIT TRANSACTION;
                    PRINT 'Transaction committed successfully.';
                END TRY
                BEGIN CATCH
                    ROLLBACK TRANSACTION;
                    PRINT 'Transaction failed. Changes were rolled back.';
                    THROW;
                END CATCH;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                -- Revert the changes made to UserAccounts.SalesAgentTypeEnum
                BEGIN TRANSACTION;

                BEGIN TRY
                    UPDATE UA
                    SET UA.SalesAgentTypeEnum = 0
                    FROM UserAccounts UA
                    INNER JOIN UserPermission UP ON UA.Id = UP.UserAccountId
                    WHERE UP.ModuleId = 1 AND UP.PermissionLevel = 1;

                    COMMIT TRANSACTION;
                    PRINT 'Rollback committed successfully.';
                END TRY
                BEGIN CATCH
                    ROLLBACK TRANSACTION;
                    PRINT 'Rollback failed. Changes were not reverted.';
                    THROW;
                END CATCH;
            ");
        }
    }
}
