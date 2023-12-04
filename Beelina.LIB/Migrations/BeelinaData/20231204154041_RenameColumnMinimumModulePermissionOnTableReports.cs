using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations.BeelinaData
{
    public partial class RenameColumnMinimumModulePermissionOnTableReports : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UserMininimumModulePermission",
                table: "Reports",
                newName: "UserMinimumModulePermission");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UserMinimumModulePermission",
                table: "Reports",
                newName: "UserMininimumModulePermission");
        }
    }
}
