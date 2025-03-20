using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class SetDefaultProductWarehouseStockReceiptEntry : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                    SET IDENTITY_INSERT ProductWarehouseStockReceiptEntries ON
                    INSERT INTO ProductWarehouseStockReceiptEntries (
                        Id
                        , SupplierId
                        , StockEntryDate
                        , ReferenceNo
                        , PlateNo
                        , DeletedById
                        , UpdatedById
                        , CreatedById
                        , DeactivatedById
                        , IsActive
                        , IsDelete
                        , DateCreated
                        , DateUpdated
                        , DateDeleted
                        , DateDeactivated
                    ) VALUES (
                        1, NULL, NULL, '', '', NULL, NULL, NULL, NULL, 1, 0, '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000'
                    ) 
                    SET IDENTITY_INSERT ProductWarehouseStockReceiptEntries OFF
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE ProductWarehouseStockReceiptEntries WHERE Id = 1
            ");
        }
    }
}
