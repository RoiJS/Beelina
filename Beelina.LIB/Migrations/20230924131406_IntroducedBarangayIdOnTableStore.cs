using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    public partial class IntroducedBarangayIdOnTableStore : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BarangayId",
                table: "Stores",
                type: "int",
                nullable: true,
                defaultValue: null);

            migrationBuilder.CreateIndex(
                name: "IX_Stores_BarangayId",
                table: "Stores",
                column: "BarangayId");

            migrationBuilder.AddForeignKey(
                name: "FK_Stores_Barangays_BarangayId",
                table: "Stores",
                column: "BarangayId",
                principalTable: "Barangays",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Stores_Barangays_BarangayId",
                table: "Stores");

            migrationBuilder.DropIndex(
                name: "IX_Stores_BarangayId",
                table: "Stores");

            migrationBuilder.DropColumn(
                name: "BarangayId",
                table: "Stores");
        }
    }
}
