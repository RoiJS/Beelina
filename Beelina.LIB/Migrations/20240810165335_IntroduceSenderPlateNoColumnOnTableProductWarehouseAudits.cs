using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class IntroduceSenderPlateNoColumnOnTableProductWarehouseAudits : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserSettings_UserAccountId",
                table: "UserSettings");

            migrationBuilder.AddColumn<string>(
                name: "SenderPlateNumber",
                table: "ProductStockWarehouseAudit",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserSettings_UserAccountId",
                table: "UserSettings",
                column: "UserAccountId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserSettings_UserAccountId",
                table: "UserSettings");

            migrationBuilder.DropColumn(
                name: "SenderPlateNumber",
                table: "ProductStockWarehouseAudit");

            migrationBuilder.CreateIndex(
                name: "IX_UserSettings_UserAccountId",
                table: "UserSettings",
                column: "UserAccountId");
        }
    }
}
