using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    public partial class IntroducedWarehouseRelatedTables : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Warehouses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDelete = table.Column<bool>(type: "bit", nullable: false),
                    DateCreated = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DateUpdated = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DateDeleted = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DateDeactivated = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Warehouses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProductStockPerWarehouse",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    WarehouseId = table.Column<int>(type: "int", nullable: false),
                    PricePerUnit = table.Column<float>(type: "real", nullable: false),
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
                    table.PrimaryKey("PK_ProductStockPerWarehouse", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductStockPerWarehouse_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductStockPerWarehouse_UserAccounts_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "UserAccounts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProductStockPerWarehouse_UserAccounts_DeactivatedById",
                        column: x => x.DeactivatedById,
                        principalTable: "UserAccounts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProductStockPerWarehouse_UserAccounts_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "UserAccounts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProductStockPerWarehouse_UserAccounts_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "UserAccounts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProductStockPerWarehouse_Warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "Warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductStockWarehouseAudit",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductStockPerWarehouseId = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    PurchaseOrderNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StockAuditSource = table.Column<int>(type: "int", nullable: false),
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
                    table.PrimaryKey("PK_ProductStockWarehouseAudit", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductStockWarehouseAudit_ProductStockPerWarehouse_ProductStockPerWarehouseId",
                        column: x => x.ProductStockPerWarehouseId,
                        principalTable: "ProductStockPerWarehouse",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductStockWarehouseAudit_UserAccounts_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "UserAccounts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProductStockWarehouseAudit_UserAccounts_DeactivatedById",
                        column: x => x.DeactivatedById,
                        principalTable: "UserAccounts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProductStockWarehouseAudit_UserAccounts_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "UserAccounts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProductStockWarehouseAudit_UserAccounts_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "UserAccounts",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProductStockPerWarehouse_CreatedById",
                table: "ProductStockPerWarehouse",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ProductStockPerWarehouse_DeactivatedById",
                table: "ProductStockPerWarehouse",
                column: "DeactivatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ProductStockPerWarehouse_DeletedById",
                table: "ProductStockPerWarehouse",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_ProductStockPerWarehouse_ProductId",
                table: "ProductStockPerWarehouse",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductStockPerWarehouse_UpdatedById",
                table: "ProductStockPerWarehouse",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ProductStockPerWarehouse_WarehouseId",
                table: "ProductStockPerWarehouse",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductStockWarehouseAudit_CreatedById",
                table: "ProductStockWarehouseAudit",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ProductStockWarehouseAudit_DeactivatedById",
                table: "ProductStockWarehouseAudit",
                column: "DeactivatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ProductStockWarehouseAudit_DeletedById",
                table: "ProductStockWarehouseAudit",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_ProductStockWarehouseAudit_ProductStockPerWarehouseId",
                table: "ProductStockWarehouseAudit",
                column: "ProductStockPerWarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductStockWarehouseAudit_UpdatedById",
                table: "ProductStockWarehouseAudit",
                column: "UpdatedById");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProductStockWarehouseAudit");

            migrationBuilder.DropTable(
                name: "ProductStockPerWarehouse");

            migrationBuilder.DropTable(
                name: "Warehouses");
        }
    }
}
