using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    public partial class InsertDefaultWarehouse : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF (NOT EXISTS(SELECT Id FROM Warehouses))
                BEGIN
                    INSERT INTO Warehouses (
                    Name
                    , Address
                    , IsActive
                    , IsDelete
                    , DateCreated
                    , DateUpdated
                    , DateDeleted
                    , DateDeactivated
                    )
                    VALUES ('Warehouse', '', 1, 0, GETDATE(), '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000')
                END
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            
        }
    }
}
