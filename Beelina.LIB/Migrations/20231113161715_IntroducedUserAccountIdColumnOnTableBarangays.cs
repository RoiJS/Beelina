using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    public partial class IntroducedUserAccountIdColumnOnTableBarangays : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UserAccountId",
                table: "Barangays",
                type: "int",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.CreateIndex(
                name: "IX_Barangays_UserAccountId",
                table: "Barangays",
                column: "UserAccountId");

            migrationBuilder.AddForeignKey(
                name: "FK_Barangays_UserAccounts_UserAccountId",
                table: "Barangays",
                column: "UserAccountId",
                principalTable: "UserAccounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Barangays_UserAccounts_UserAccountId",
                table: "Barangays");

            migrationBuilder.DropIndex(
                name: "IX_Barangays_UserAccountId",
                table: "Barangays");

            migrationBuilder.DropColumn(
                name: "UserAccountId",
                table: "Barangays");
        }
    }
}
