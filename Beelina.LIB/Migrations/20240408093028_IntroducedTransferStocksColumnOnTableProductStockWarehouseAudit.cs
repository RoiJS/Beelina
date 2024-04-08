using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    public partial class IntroducedTransferStocksColumnOnTableProductStockWarehouseAudit : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "WarehouseId",
                table: "Transactions",
                type: "int",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<int>(
                name: "DestinationProductStockPerWarehouseId",
                table: "ProductStockWarehouseAudit",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SourceProductNumberOfUnits",
                table: "ProductStockWarehouseAudit",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SourceProductStockPerWarehouseId",
                table: "ProductStockWarehouseAudit",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TransferProductStockType",
                table: "ProductStockWarehouseAudit",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "WarehouseId",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "DestinationProductStockPerWarehouseId",
                table: "ProductStockWarehouseAudit");

            migrationBuilder.DropColumn(
                name: "SourceProductNumberOfUnits",
                table: "ProductStockWarehouseAudit");

            migrationBuilder.DropColumn(
                name: "SourceProductStockPerWarehouseId",
                table: "ProductStockWarehouseAudit");

            migrationBuilder.DropColumn(
                name: "TransferProductStockType",
                table: "ProductStockWarehouseAudit");
        }
    }
}
