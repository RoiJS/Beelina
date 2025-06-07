using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class AlterReportEndingInventoryPerProductAdmin20250602 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
migrationBuilder.Sql(@"
-- =============================================
-- Author:		Amatong, Roi Larrence
-- Create date: 2024-08-12
-- Description:	Ending inventory data from warehouse for Admin accounts

-- Modified By: Amatong, Roi Larrence 
-- Modified Date: 2025-06-02
-- Description: Introduced Report version for business model 3 (#282)
-- =============================================
-- exec Report_Ending_Inventory_Per_Product_Admin @startDate='2025-05-01', @endDate = '2025-05-30'
ALTER   PROCEDURE [dbo].[Report_Ending_Inventory_Per_Product_Admin]
	@startDate VARCHAR(10) = NULL
	, @endDate VARCHAR(10) = NULL
	, @userId INT = 0
	, @warehouseId INT = 1
AS
BEGIN

	DECLARE @warehouseName AS NVARCHAR(MAX)
	DECLARE @businessModel AS INT

	SET @businessModel = COALESCE((SELECT BusinessModel FROM GeneralSettings), 1)
	SET @warehouseName = COALESCE((SELECT [Name] FROM Warehouses u WHERE Id = @warehouseId), '')

    -- (1) Report Header
	SELECT
		@warehouseName AS WarehouseName
		, @startDate AS FromDate
		, @endDate AS ToDate
		, @businessModel AS BusinessModel
	
	-- (2) Report Data
	IF @businessModel = 1 
		EXEC Report_Ending_Inventory_Per_Product_Warehouse_Model_1 @startDate, @endDate, 0, @warehouseId

	IF @businessModel = 2
		EXEC Report_Ending_Inventory_Per_Product_Warehouse_Model_2 @startDate, @endDate, @userId, @warehouseId

	IF @businessModel = 3
		EXEC Report_Ending_Inventory_Per_Product_Warehouse_Model_3 @startDate, @endDate, @userId, @warehouseId
END	
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
