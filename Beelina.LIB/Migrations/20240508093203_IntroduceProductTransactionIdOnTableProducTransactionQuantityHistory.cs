using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class IntroduceProductTransactionIdOnTableProducTransactionQuantityHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ProductTransactionId",
                table: "ProductTransactionQuantityHistory",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_ProductTransactionQuantityHistory_ProductTransactionId",
                table: "ProductTransactionQuantityHistory",
                column: "ProductTransactionId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductTransactionQuantityHistory_ProductTransactions_ProductTransactionId",
                table: "ProductTransactionQuantityHistory",
                column: "ProductTransactionId",
                principalTable: "ProductTransactions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductTransactionQuantityHistory_ProductTransactions_ProductTransactionId",
                table: "ProductTransactionQuantityHistory");

            migrationBuilder.DropIndex(
                name: "IX_ProductTransactionQuantityHistory_ProductTransactionId",
                table: "ProductTransactionQuantityHistory");

            migrationBuilder.DropColumn(
                name: "ProductTransactionId",
                table: "ProductTransactionQuantityHistory");
        }
    }
}
