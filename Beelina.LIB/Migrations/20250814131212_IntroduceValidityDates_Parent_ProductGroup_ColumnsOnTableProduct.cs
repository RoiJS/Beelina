using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class IntroduceValidityDates_Parent_ProductGroup_ColumnsOnTableProduct : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Parent",
                table: "Products",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "ProductParentGroupId",
                table: "Products",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ValidityFrom",
                table: "Products",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "ValidityTo",
                table: "Products",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateIndex(
                name: "IX_Products_ProductParentGroupId",
                table: "Products",
                column: "ProductParentGroupId");

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Products_ProductParentGroupId",
                table: "Products",
                column: "ProductParentGroupId",
                principalTable: "Products",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Products_Products_ProductParentGroupId",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Products_ProductParentGroupId",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Parent",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "ProductParentGroupId",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "ValidityFrom",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "ValidityTo",
                table: "Products");
        }
    }
}
