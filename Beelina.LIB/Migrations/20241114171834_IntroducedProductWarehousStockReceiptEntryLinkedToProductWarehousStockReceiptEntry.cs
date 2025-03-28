using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class IntroducedProductWarehousStockReceiptEntryLinkedToProductWarehousStockReceiptEntry : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_ProductStockWarehouseAudit_ProductWarehousStockReceiptEntryId",
                table: "ProductStockWarehouseAudit",
                column: "ProductWarehousStockReceiptEntryId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductStockWarehouseAudit_ProductWarehousStockReceiptEntries_ProductWarehousStockReceiptEntryId",
                table: "ProductStockWarehouseAudit",
                column: "ProductWarehousStockReceiptEntryId",
                principalTable: "ProductWarehousStockReceiptEntries",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductStockWarehouseAudit_ProductWarehousStockReceiptEntries_ProductWarehousStockReceiptEntryId",
                table: "ProductStockWarehouseAudit");

            migrationBuilder.DropIndex(
                name: "IX_ProductStockWarehouseAudit_ProductWarehousStockReceiptEntryId",
                table: "ProductStockWarehouseAudit");
        }
    }
}
