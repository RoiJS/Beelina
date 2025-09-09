using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class SetAllowOrderConfirmationAndAllowOrderPaymentsAsDefaultFalseOnTableUserSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Update the default value for AllowOrderConfirmation column to false
            migrationBuilder.AlterColumn<bool>(
                name: "AllowOrderConfirmation",
                table: "UserSettings",
                type: "bit",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: true);

            // Update the default value for AllowOrderPayments column to false
            migrationBuilder.AlterColumn<bool>(
                name: "AllowOrderPayments",
                table: "UserSettings",
                type: "bit",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Revert the default value for AllowOrderConfirmation column back to true
            migrationBuilder.AlterColumn<bool>(
                name: "AllowOrderConfirmation",
                table: "UserSettings",
                type: "bit",
                nullable: false,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: false);

            // Revert the default value for AllowOrderPayments column back to true
            migrationBuilder.AlterColumn<bool>(
                name: "AllowOrderPayments",
                table: "UserSettings",
                type: "bit",
                nullable: false,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: false);
        }
    }
}
