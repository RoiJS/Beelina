﻿using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class IntroducedTableProductWarehousStockReceiptEntries : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ProductWarehousStockReceiptEntryId",
                table: "ProductStockWarehouseAudit",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ProductWarehousStockReceiptEntries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SupplierId = table.Column<int>(type: "int", nullable: false),
                    StockEntryDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReferenceNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PlateNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                    table.PrimaryKey("PK_ProductWarehousStockReceiptEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductWarehousStockReceiptEntries_Suppliers_SupplierId",
                        column: x => x.SupplierId,
                        principalTable: "Suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductWarehousStockReceiptEntries_UserAccounts_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "UserAccounts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProductWarehousStockReceiptEntries_UserAccounts_DeactivatedById",
                        column: x => x.DeactivatedById,
                        principalTable: "UserAccounts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProductWarehousStockReceiptEntries_UserAccounts_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "UserAccounts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProductWarehousStockReceiptEntries_UserAccounts_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "UserAccounts",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProductWarehousStockReceiptEntries_CreatedById",
                table: "ProductWarehousStockReceiptEntries",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ProductWarehousStockReceiptEntries_DeactivatedById",
                table: "ProductWarehousStockReceiptEntries",
                column: "DeactivatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ProductWarehousStockReceiptEntries_DeletedById",
                table: "ProductWarehousStockReceiptEntries",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_ProductWarehousStockReceiptEntries_SupplierId",
                table: "ProductWarehousStockReceiptEntries",
                column: "SupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductWarehousStockReceiptEntries_UpdatedById",
                table: "ProductWarehousStockReceiptEntries",
                column: "UpdatedById");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProductWarehousStockReceiptEntries");

            migrationBuilder.DropColumn(
                name: "ProductWarehousStockReceiptEntryId",
                table: "ProductStockWarehouseAudit");
        }
    }
}
