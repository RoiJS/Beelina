using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class IntroducedPrintInvoiceRelatedColumnsOnTableGeneralSettingsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CompanyName",
                table: "GeneralSettings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FaxTelephone",
                table: "GeneralSettings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InvoiceFooterText",
                table: "GeneralSettings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "In the event of judicial action to enforce collection of the price of any part thereof the buyer agrees that same may be instituted in the courts of Zamboanga City");

            migrationBuilder.AddColumn<string>(
                name: "InvoiceFooterText1",
                table: "GeneralSettings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "RECEIVED merchandise in good order & condition:");

            migrationBuilder.AddColumn<string>(
                name: "OwnerName",
                table: "GeneralSettings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Telephone",
                table: "GeneralSettings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Tin",
                table: "GeneralSettings",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompanyName",
                table: "GeneralSettings");

            migrationBuilder.DropColumn(
                name: "FaxTelephone",
                table: "GeneralSettings");

            migrationBuilder.DropColumn(
                name: "InvoiceFooterText",
                table: "GeneralSettings");

            migrationBuilder.DropColumn(
                name: "InvoiceFooterText1",
                table: "GeneralSettings");

            migrationBuilder.DropColumn(
                name: "OwnerName",
                table: "GeneralSettings");

            migrationBuilder.DropColumn(
                name: "Telephone",
                table: "GeneralSettings");

            migrationBuilder.DropColumn(
                name: "Tin",
                table: "GeneralSettings");
        }
    }
}
