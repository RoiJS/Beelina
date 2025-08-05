using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class IntroducePrintReceiptFontSizeOnTableUserSettings : Migration
    {
        /// <summary>
        /// Adds the non-nullable "PrintReceiptFontSize" integer column with a default value of 0 to the "UserSettings" table.
        /// </summary>
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PrintReceiptFontSize",
                table: "UserSettings",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <summary>
        /// Reverts the migration by removing the "PrintReceiptFontSize" column from the "UserSettings" table.
        /// </summary>
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PrintReceiptFontSize",
                table: "UserSettings");
        }
    }
}
