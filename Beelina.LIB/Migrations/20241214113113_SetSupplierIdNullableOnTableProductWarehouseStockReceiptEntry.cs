using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class SetSupplierIdNullableOnTableProductWarehouseStockReceiptEntry : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductWarehouseStockReceiptEntries_Suppliers_SupplierId",
                table: "ProductWarehouseStockReceiptEntries");

            migrationBuilder.AlterColumn<int>(
                name: "SupplierId",
                table: "ProductWarehouseStockReceiptEntries",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductWarehouseStockReceiptEntries_Suppliers_SupplierId",
                table: "ProductWarehouseStockReceiptEntries",
                column: "SupplierId",
                principalTable: "Suppliers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductWarehouseStockReceiptEntries_Suppliers_SupplierId",
                table: "ProductWarehouseStockReceiptEntries");

            migrationBuilder.AlterColumn<int>(
                name: "SupplierId",
                table: "ProductWarehouseStockReceiptEntries",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductWarehouseStockReceiptEntries_Suppliers_SupplierId",
                table: "ProductWarehouseStockReceiptEntries",
                column: "SupplierId",
                principalTable: "Suppliers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
