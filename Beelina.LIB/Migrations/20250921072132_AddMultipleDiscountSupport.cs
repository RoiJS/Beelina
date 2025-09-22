using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class AddMultipleDiscountSupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProductWarehouseStockReceiptDiscounts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductWarehouseStockReceiptEntryId = table.Column<int>(type: "int", nullable: false),
                    DiscountPercentage = table.Column<double>(type: "float", nullable: false),
                    DiscountOrder = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                    table.PrimaryKey("PK_ProductWarehouseStockReceiptDiscounts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductWarehouseStockReceiptDiscounts_ProductWarehouseStockReceiptEntries_ProductWarehouseStockReceiptEntryId",
                        column: x => x.ProductWarehouseStockReceiptEntryId,
                        principalTable: "ProductWarehouseStockReceiptEntries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductWarehouseStockReceiptDiscounts_UserAccounts_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "UserAccounts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProductWarehouseStockReceiptDiscounts_UserAccounts_DeactivatedById",
                        column: x => x.DeactivatedById,
                        principalTable: "UserAccounts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProductWarehouseStockReceiptDiscounts_UserAccounts_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "UserAccounts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProductWarehouseStockReceiptDiscounts_UserAccounts_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "UserAccounts",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProductWarehouseStockReceiptDiscounts_CreatedById",
                table: "ProductWarehouseStockReceiptDiscounts",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ProductWarehouseStockReceiptDiscounts_DeactivatedById",
                table: "ProductWarehouseStockReceiptDiscounts",
                column: "DeactivatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ProductWarehouseStockReceiptDiscounts_DeletedById",
                table: "ProductWarehouseStockReceiptDiscounts",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_ProductWarehouseStockReceiptDiscounts_ProductWarehouseStockReceiptEntryId",
                table: "ProductWarehouseStockReceiptDiscounts",
                column: "ProductWarehouseStockReceiptEntryId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductWarehouseStockReceiptDiscounts_UpdatedById",
                table: "ProductWarehouseStockReceiptDiscounts",
                column: "UpdatedById");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProductWarehouseStockReceiptDiscounts");
        }
    }
}
