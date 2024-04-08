using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    public partial class IntroduceGeneralSettingsTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GeneralSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BusinessModel = table.Column<int>(type: "int", nullable: false),
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
                    table.PrimaryKey("PK_GeneralSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GeneralSettings_UserAccounts_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "UserAccounts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_GeneralSettings_UserAccounts_DeactivatedById",
                        column: x => x.DeactivatedById,
                        principalTable: "UserAccounts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_GeneralSettings_UserAccounts_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "UserAccounts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_GeneralSettings_UserAccounts_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "UserAccounts",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_GeneralSettings_CreatedById",
                table: "GeneralSettings",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_GeneralSettings_DeactivatedById",
                table: "GeneralSettings",
                column: "DeactivatedById");

            migrationBuilder.CreateIndex(
                name: "IX_GeneralSettings_DeletedById",
                table: "GeneralSettings",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_GeneralSettings_UpdatedById",
                table: "GeneralSettings",
                column: "UpdatedById");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GeneralSettings");
        }
    }
}
