using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class DropOldEndingInventoryReportDatabaseObjects : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DROP PROCEDURE IF EXISTS [dbo].[Report_Ending_Inventory_Per_Product]
                DROP PROCEDURE IF EXISTS [dbo].[Report_Ending_Inventory_Per_Product_Panel]
                DROP PROCEDURE IF EXISTS [dbo].[Report_Ending_Inventory_Per_Product_Warehouse]
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
