using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class SetProductWarehouseStockReceiptEntryIdNotNullableOnTableProductStockWarehouseAudits : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductStockWarehouseAudit_ProductWarehouseStockReceiptEntries_ProductWarehouseStockReceiptEntryId",
                table: "ProductStockWarehouseAudit");

            migrationBuilder.AlterColumn<int>(
                name: "ProductWarehouseStockReceiptEntryId",
                table: "ProductStockWarehouseAudit",
                type: "int",
                nullable: false,
                defaultValue: 1,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductStockWarehouseAudit_ProductWarehouseStockReceiptEntries_ProductWarehouseStockReceiptEntryId",
                table: "ProductStockWarehouseAudit",
                column: "ProductWarehouseStockReceiptEntryId",
                principalTable: "ProductWarehouseStockReceiptEntries",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductStockWarehouseAudit_ProductWarehouseStockReceiptEntries_ProductWarehouseStockReceiptEntryId",
                table: "ProductStockWarehouseAudit");

            migrationBuilder.AlterColumn<int>(
                name: "ProductWarehouseStockReceiptEntryId",
                table: "ProductStockWarehouseAudit",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductStockWarehouseAudit_ProductWarehouseStockReceiptEntries_ProductWarehouseStockReceiptEntryId",
                table: "ProductStockWarehouseAudit",
                column: "ProductWarehouseStockReceiptEntryId",
                principalTable: "ProductWarehouseStockReceiptEntries",
                principalColumn: "Id");
        }
    }
}
