using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    public partial class SetupDefaultPaymentMethods : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF (NOT EXISTS(SELECT Id FROM PaymentMethods))
BEGIN
SET  IDENTITY_INSERT PaymentMethods ON
INSERT INTO PaymentMethods (
Id
, Name
, IsActive
, IsDelete
, DateCreated
, DateUpdated
, DateDeleted
, DateDeactivated
)
VALUES (1, 'Cash', 1, 0, GETDATE(),	'0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000') 
, (2, 'Cheque', 1, 0, GETDATE(),	'0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000') 
, (3,'Account Receivable', 1, 0, GETDATE(), '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000') 
	
SET  IDENTITY_INSERT PaymentMethods OFF
END
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
