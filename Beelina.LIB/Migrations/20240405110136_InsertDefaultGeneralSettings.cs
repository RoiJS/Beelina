using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    public partial class InsertDefaultGeneralSettings : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
    IF (NOT EXISTS(SELECT Id FROM GeneralSettings))
BEGIN
SET  IDENTITY_INSERT GeneralSettings ON
INSERT INTO GeneralSettings (
Id
, BusinessModel
, IsActive
, IsDelete
, DateCreated
, DateUpdated
, DateDeleted
, DateDeactivated
)
VALUES (1, 1, 1, 0, GETDATE(),	'0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000') 
SET  IDENTITY_INSERT GeneralSettings OFF
END
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
