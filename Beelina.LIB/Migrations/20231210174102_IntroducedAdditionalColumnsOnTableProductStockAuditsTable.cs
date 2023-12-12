using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    public partial class IntroducedAdditionalColumnsOnTableProductStockAuditsTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DestinationProductStockPerPanelId",
                table: "ProductStockAudits",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SourceProductNumberOfUnits",
                table: "ProductStockAudits",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SourceProductStockPerPanelId",
                table: "ProductStockAudits",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DestinationProductStockPerPanelId",
                table: "ProductStockAudits");

            migrationBuilder.DropColumn(
                name: "SourceProductNumberOfUnits",
                table: "ProductStockAudits");

            migrationBuilder.DropColumn(
                name: "SourceProductStockPerPanelId",
                table: "ProductStockAudits");
        }
    }
}
