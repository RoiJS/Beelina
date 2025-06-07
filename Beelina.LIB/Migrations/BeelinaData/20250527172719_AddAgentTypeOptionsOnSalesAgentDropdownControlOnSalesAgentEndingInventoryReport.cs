using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations.BeelinaData
{
    /// <inheritdoc />
    public partial class AddAgentTypeOptionsOnSalesAgentDropdownControlOnSalesAgentEndingInventoryReport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE ReportControlsRelations SET AgentTypeOptions = '1' WHERE ReportControlId = 5 and ReportId = 4 -- Make Field Agents available on Sales Agent Ending Inventory Per Product Report
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE ReportControlsRelations SET AgentTypeOptions = NULL WHERE ReportControlId = 5 and ReportId = 4 -- Make Field Agents available on Sales Agent Ending Inventory Per Product Report
            ");
        }
    }
}
