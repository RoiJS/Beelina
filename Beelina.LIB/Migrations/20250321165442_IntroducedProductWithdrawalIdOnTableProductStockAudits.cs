using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class IntroducedProductWithdrawalIdOnTableProductStockAudits : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ProductWithdrawalEntryId",
                table: "ProductStockAudits",
                type: "int",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.CreateIndex(
                name: "IX_ProductStockAudits_ProductWithdrawalEntryId",
                table: "ProductStockAudits",
                column: "ProductWithdrawalEntryId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductStockAudits_ProductWithdrawalEntries_ProductWithdrawalEntryId",
                table: "ProductStockAudits",
                column: "ProductWithdrawalEntryId",
                principalTable: "ProductWithdrawalEntries",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductStockAudits_ProductWithdrawalEntries_ProductWithdrawalEntryId",
                table: "ProductStockAudits");

            migrationBuilder.DropIndex(
                name: "IX_ProductStockAudits_ProductWithdrawalEntryId",
                table: "ProductStockAudits");

            migrationBuilder.DropColumn(
                name: "ProductWithdrawalEntryId",
                table: "ProductStockAudits");
        }
    }
}
