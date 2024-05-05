using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    public partial class IntroduceTVF_Warehouse_Product_Absolute_Stocks : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
migrationBuilder.Sql(@"
-- =============================================
-- Author:		Roi Larrence Amatong
-- Create date: 2024-04-10
-- Description: Return warehouse absolute stocks for all products
-- =============================================
CREATE OR ALTER FUNCTION [dbo].[TVF_Warehouse_Product_Absolute_Stocks] 
(	
	-- Add the parameters for the function here
	@warehouseId INT = 0
)
RETURNS TABLE 
AS
RETURN 
(
	SELECT 
		p.Id AS ProductId
		, p.Code
		, p.[Name]
		, p.PricePerUnit
		, FORMAT(ps.DateCreated, 'yyyy-MM-dd') AS StockDate
		, SUM(ps.Quantity) as AbsoluteStocks
	FROM 
	
		Products p

		LEFT JOIN ProductStockPerWarehouse pw
		ON p.Id = pw.ProductId and pw.WarehouseId = @warehouseId

		LEFT JOIN ProductStockWarehouseAudit ps
		ON ps.ProductStockPerWarehouseId = pw.Id

	WHERE 
		--p.IsDelete = 0
		--AND p.IsActive = 1
		pw.IsDelete = 0
		AND pw.IsActive = 1
		AND ps.IsDelete = 0
		AND ps.IsActive = 1

	GROUP BY
		p.Id
		, p.Code
		, p.[Name]
		, p.PricePerUnit
		, FORMAT(ps.DateCreated, 'yyyy-MM-dd')
)
GO
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
