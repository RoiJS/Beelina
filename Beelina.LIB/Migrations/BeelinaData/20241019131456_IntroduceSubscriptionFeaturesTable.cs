using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations.BeelinaData
{
    /// <inheritdoc />
    public partial class IntroduceSubscriptionFeaturesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SubscriptionFeatures",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SubscriptionId = table.Column<int>(type: "int", nullable: false),
                    Version = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Custom = table.Column<bool>(type: "bit", nullable: false),
                    OfflineModeActive = table.Column<bool>(type: "bit", nullable: false),
                    ProductSKUMax = table.Column<int>(type: "int", nullable: false),
                    TopProductsPageActive = table.Column<bool>(type: "bit", nullable: false),
                    CustomerAccountsMax = table.Column<int>(type: "int", nullable: false),
                    CustomersMax = table.Column<int>(type: "int", nullable: false),
                    DashboardDistributionPageActive = table.Column<int>(type: "int", nullable: false),
                    OrderPrintActive = table.Column<int>(type: "int", nullable: false),
                    SendReportEmailActive = table.Column<bool>(type: "bit", nullable: false),
                    UserAccountsMax = table.Column<int>(type: "int", nullable: false),
                    RegisterUserAddOnActive = table.Column<bool>(type: "bit", nullable: false),
                    CustomReportAddOnActive = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDelete = table.Column<bool>(type: "bit", nullable: false),
                    DateCreated = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DateUpdated = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DateDeleted = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DateDeactivated = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubscriptionFeatures", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SubscriptionFeatures_Subscriptions_SubscriptionId",
                        column: x => x.SubscriptionId,
                        principalTable: "Subscriptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionFeatures_SubscriptionId",
                table: "SubscriptionFeatures",
                column: "SubscriptionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SubscriptionFeatures");
        }
    }
}
