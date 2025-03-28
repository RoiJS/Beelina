using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class IntroduceTableProductWithdrawalEntries : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProductWithdrawalEntries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StockEntryDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    WithdrawalSlipNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<int>(type: "int", nullable: true),
                    UpdatedById = table.Column<int>(type: "int", nullable: true),
                    CreatedById = table.Column<int>(type: "int", nullable: true),
                    DeactivatedById = table.Column<int>(type: "int", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDelete = table.Column<bool>(type: "bit", nullable: false),
                    DateCreated = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DateUpdated = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DateDeleted = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DateDeactivated = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductWithdrawalEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductWithdrawalEntries_UserAccounts_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "UserAccounts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProductWithdrawalEntries_UserAccounts_DeactivatedById",
                        column: x => x.DeactivatedById,
                        principalTable: "UserAccounts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProductWithdrawalEntries_UserAccounts_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "UserAccounts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProductWithdrawalEntries_UserAccounts_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "UserAccounts",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProductWithdrawalEntries_CreatedById",
                table: "ProductWithdrawalEntries",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ProductWithdrawalEntries_DeactivatedById",
                table: "ProductWithdrawalEntries",
                column: "DeactivatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ProductWithdrawalEntries_DeletedById",
                table: "ProductWithdrawalEntries",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_ProductWithdrawalEntries_UpdatedById",
                table: "ProductWithdrawalEntries",
                column: "UpdatedById");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProductWithdrawalEntries");
        }
    }
}
