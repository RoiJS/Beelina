using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class RenameColumnProductWarehousStockReceiptEntryIdOnTableProductWarehouseStockReceiptEntries : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductStockWarehouseAudit_ProductWarehouseStockReceiptEntries_ProductWarehousStockReceiptEntryId",
                table: "ProductStockWarehouseAudit");

            migrationBuilder.RenameColumn(
                name: "ProductWarehousStockReceiptEntryId",
                table: "ProductStockWarehouseAudit",
                newName: "ProductWarehouseStockReceiptEntryId");

            migrationBuilder.RenameIndex(
                name: "IX_ProductStockWarehouseAudit_ProductWarehousStockReceiptEntryId",
                table: "ProductStockWarehouseAudit",
                newName: "IX_ProductStockWarehouseAudit_ProductWarehouseStockReceiptEntryId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductStockWarehouseAudit_ProductWarehouseStockReceiptEntries_ProductWarehouseStockReceiptEntryId",
                table: "ProductStockWarehouseAudit",
                column: "ProductWarehouseStockReceiptEntryId",
                principalTable: "ProductWarehouseStockReceiptEntries",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductStockWarehouseAudit_ProductWarehouseStockReceiptEntries_ProductWarehouseStockReceiptEntryId",
                table: "ProductStockWarehouseAudit");

            migrationBuilder.RenameColumn(
                name: "ProductWarehouseStockReceiptEntryId",
                table: "ProductStockWarehouseAudit",
                newName: "ProductWarehousStockReceiptEntryId");

            migrationBuilder.RenameIndex(
                name: "IX_ProductStockWarehouseAudit_ProductWarehouseStockReceiptEntryId",
                table: "ProductStockWarehouseAudit",
                newName: "IX_ProductStockWarehouseAudit_ProductWarehousStockReceiptEntryId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductStockWarehouseAudit_ProductWarehouseStockReceiptEntries_ProductWarehousStockReceiptEntryId",
                table: "ProductStockWarehouseAudit",
                column: "ProductWarehousStockReceiptEntryId",
                principalTable: "ProductWarehouseStockReceiptEntries",
                principalColumn: "Id");
        }
    }
}
