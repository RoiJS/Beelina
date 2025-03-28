using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations.BeelinaData
{
    /// <inheritdoc />
    public partial class IntroduceStartAndEndDateOnSubscriptionsPriceVersionsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Date",
                table: "SubscriptionReportAddonPriceVersions",
                newName: "StartDate");

            migrationBuilder.RenameColumn(
                name: "Date",
                table: "SubscriptionRegisterUserAddonPriceVersion",
                newName: "StartDate");

            migrationBuilder.RenameColumn(
                name: "Date",
                table: "SubscriptionPriceVersions",
                newName: "StartDate");

            migrationBuilder.AddColumn<DateTime>(
                name: "EndDate",
                table: "SubscriptionReportAddonPriceVersions",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "EndDate",
                table: "SubscriptionRegisterUserAddonPriceVersion",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "EndDate",
                table: "SubscriptionPriceVersions",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionFeatureHideDashboardWidgets_SubscriptionFeatureId",
                table: "SubscriptionFeatureHideDashboardWidgets",
                column: "SubscriptionFeatureId");

            migrationBuilder.AddForeignKey(
                name: "FK_SubscriptionFeatureHideDashboardWidgets_SubscriptionFeatures_SubscriptionFeatureId",
                table: "SubscriptionFeatureHideDashboardWidgets",
                column: "SubscriptionFeatureId",
                principalTable: "SubscriptionFeatures",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SubscriptionFeatureHideDashboardWidgets_SubscriptionFeatures_SubscriptionFeatureId",
                table: "SubscriptionFeatureHideDashboardWidgets");

            migrationBuilder.DropIndex(
                name: "IX_SubscriptionFeatureHideDashboardWidgets_SubscriptionFeatureId",
                table: "SubscriptionFeatureHideDashboardWidgets");

            migrationBuilder.DropColumn(
                name: "EndDate",
                table: "SubscriptionReportAddonPriceVersions");

            migrationBuilder.DropColumn(
                name: "EndDate",
                table: "SubscriptionRegisterUserAddonPriceVersion");

            migrationBuilder.DropColumn(
                name: "EndDate",
                table: "SubscriptionPriceVersions");

            migrationBuilder.RenameColumn(
                name: "StartDate",
                table: "SubscriptionReportAddonPriceVersions",
                newName: "Date");

            migrationBuilder.RenameColumn(
                name: "StartDate",
                table: "SubscriptionRegisterUserAddonPriceVersion",
                newName: "Date");

            migrationBuilder.RenameColumn(
                name: "StartDate",
                table: "SubscriptionPriceVersions",
                newName: "Date");
        }
    }
}
