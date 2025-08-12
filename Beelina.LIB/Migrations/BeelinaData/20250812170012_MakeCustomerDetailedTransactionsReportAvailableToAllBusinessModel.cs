using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations.BeelinaData
{
    /// <inheritdoc />
    public partial class MakeCustomerDetailedTransactionsReportAvailableToAllBusinessModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Reports set OnlyAvailableOnBusinessModel = NULL where Id in (8)
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Reports set OnlyAvailableOnBusinessModel = 2 where Id in (8)
            ");
        }
    }
}
