using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class IntroducedUserAccountIdOnTableProductWithdrawalEntries : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UserAccountId",
                table: "ProductWithdrawalEntries",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductWithdrawalEntries_UserAccountId",
                table: "ProductWithdrawalEntries",
                column: "UserAccountId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductWithdrawalEntries_UserAccounts_UserAccountId",
                table: "ProductWithdrawalEntries",
                column: "UserAccountId",
                principalTable: "UserAccounts",
                principalColumn: "Id");

            // Insert default user account id
            migrationBuilder.Sql(@"UPDATE ProductWithdrawalEntries SET UserAccountId = 1 WHERE Id = 1;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductWithdrawalEntries_UserAccounts_UserAccountId",
                table: "ProductWithdrawalEntries");

            migrationBuilder.DropIndex(
                name: "IX_ProductWithdrawalEntries_UserAccountId",
                table: "ProductWithdrawalEntries");

            migrationBuilder.DropColumn(
                name: "UserAccountId",
                table: "ProductWithdrawalEntries");

        }
    }
}
