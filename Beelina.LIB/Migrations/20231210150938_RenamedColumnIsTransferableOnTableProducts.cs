using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    public partial class RenamedColumnIsTransferableOnTableProducts : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IsTransferrable",
                table: "Products",
                newName: "IsTransferable");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IsTransferable",
                table: "Products",
                newName: "IsTransferrable");
        }
    }
}
