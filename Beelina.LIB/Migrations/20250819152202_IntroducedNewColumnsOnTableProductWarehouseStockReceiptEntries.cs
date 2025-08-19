using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class IntroducedNewColumnsOnTableProductWarehouseStockReceiptEntries : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DateEncoded",
                table: "ProductWarehouseStockReceiptEntries",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Discount",
                table: "ProductWarehouseStockReceiptEntries",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<DateTime>(
                name: "InvoiceDate",
                table: "ProductWarehouseStockReceiptEntries",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InvoiceNo",
                table: "ProductWarehouseStockReceiptEntries",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "ProductWarehouseStockReceiptEntries",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PurchaseOrderStatus",
                table: "ProductWarehouseStockReceiptEntries",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DateEncoded",
                table: "ProductWarehouseStockReceiptEntries");

            migrationBuilder.DropColumn(
                name: "Discount",
                table: "ProductWarehouseStockReceiptEntries");

            migrationBuilder.DropColumn(
                name: "InvoiceDate",
                table: "ProductWarehouseStockReceiptEntries");

            migrationBuilder.DropColumn(
                name: "InvoiceNo",
                table: "ProductWarehouseStockReceiptEntries");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "ProductWarehouseStockReceiptEntries");

            migrationBuilder.DropColumn(
                name: "PurchaseOrderStatus",
                table: "ProductWarehouseStockReceiptEntries");
        }
    }
}
