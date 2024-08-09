using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class AddDefaultUserSettingsForAllUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                -- Set Default User Settings for existing users
                -- =========================================================================================================
                IF ((SELECT COUNT(Id) FROM UserSettings) = 0)
                BEGIN
                    INSERT INTO UserSettings (UserAccountId, DateCreated, DateUpdated, DateDeleted, DateDeactivated)
                    SELECT 
                        Id AS UserAccountId
                        , GETDATE() AS DateCreated
                        , '0001-01-01 00:00:00.0000000' AS DateUpdated
                        , '0001-01-01 00:00:00.0000000' AS DateDeleted
                        , '0001-01-01 00:00:00.0000000' AS DateDeactivated
                    FROM UserAccounts
                END
                -- =========================================================================================================
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
