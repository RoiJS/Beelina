using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class RenamedSalesAgentTypeColumnOnTableUserAccounts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "SalesAgentTypeEnum",
                table: "UserAccounts",
                newName: "SalesAgentType");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "SalesAgentType",
                table: "UserAccounts",
                newName: "SalesAgentTypeEnum");
        }
    }
}
