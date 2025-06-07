using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations.BeelinaData
{
    /// <inheritdoc />
    public partial class UpdateEndingInventoryPerProductReportAgentBusinessModelAvailability : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Reports SET OnlyAvailableOnBusinessModel = '1;3' WHERE Id = 4 -- Make the Sales Agent Ending Inventory Per Product Report available on Business Models 1 and 3
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Reports SET OnlyAvailableOnBusinessModel = NULL WHERE Id = 4 -- Revert update
            ");
        }
    }
}
