using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations.BeelinaData
{
    /// <inheritdoc />
    public partial class IntroduceSubscriptionFeatureHideDashboardWidgetsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SubscriptionFeatureHideDashboardWidgets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SubscriptionFeatureId = table.Column<int>(type: "int", nullable: false),
                    DashboardModuleWidgetId = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDelete = table.Column<bool>(type: "bit", nullable: false),
                    DateCreated = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DateUpdated = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DateDeleted = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DateDeactivated = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubscriptionFeatureHideDashboardWidgets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SubscriptionFeatureHideDashboardWidgets_DashboardModuleWidgets_DashboardModuleWidgetId",
                        column: x => x.DashboardModuleWidgetId,
                        principalTable: "DashboardModuleWidgets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionFeatureHideDashboardWidgets_DashboardModuleWidgetId",
                table: "SubscriptionFeatureHideDashboardWidgets",
                column: "DashboardModuleWidgetId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SubscriptionFeatureHideDashboardWidgets");
        }
    }
}
