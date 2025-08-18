using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class RenameProductValidityColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ValidityFrom",
                table: "Products");

            migrationBuilder.RenameColumn(
                name: "ValidityTo",
                table: "Products",
                newName: "ValidFrom");

            migrationBuilder.AddColumn<DateTime>(
                name: "ValidTo",
                table: "Products",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ValidTo",
                table: "Products");

            migrationBuilder.RenameColumn(
                name: "ValidFrom",
                table: "Products",
                newName: "ValidityTo");

            migrationBuilder.AddColumn<DateTime>(
                name: "ValidityFrom",
                table: "Products",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }
    }
}
