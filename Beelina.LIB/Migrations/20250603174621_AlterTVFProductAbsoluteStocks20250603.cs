using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class AlterTVFProductAbsoluteStocks20250603 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
-- =============================================
-- Author:		Roi Larrence Amatong
-- Create date: 2023-11-16
-- Description: Return absolute stocks for all products

-- Modified By:		Roi Larrence Amatong
-- Create date: 2024-08-12
-- Description: Introduced @warehouseId parameter. Modified to allow getting absolute stocks for all agents 

-- Modified By:		Roi Larrence Amatong
-- Create date: 2025-06-03
-- Description: Added column StockAuditSource
-- =============================================
ALTER FUNCTION [dbo].[TVF_Product_Absolute_Stocks] 
(	
	-- Add the parameters for the function here
	@userId INT = 0,
	@warehouseId INT = 1
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
		, ps.StockAuditSource
		, FORMAT(ps.DateCreated, 'yyyy-MM-dd') AS StockDate
		, SUM(ps.Quantity) as AbsoluteStocks
	FROM 
	
		Products p

		LEFT JOIN ProductStockPerPanels pp
		ON p.Id = pp.ProductId 
			AND (
					(@userId > 0 and pp.UserAccountId = @userId) OR 
					(@userId = 0 and pp.UserAccountId = pp.UserAccountId)
				)

		LEFT JOIN ProductStockAudits ps
		ON ps.ProductStockPerPanelId = pp.Id

	WHERE 
		p.IsDelete = 0
		AND p.IsActive = 1
		AND pp.IsDelete = 0
		AND pp.IsActive = 1
		AND ps.IsDelete = 0
		AND ps.IsActive = 1
		AND ps.WarehouseId = @warehouseId
		
	GROUP BY
		p.Id
		, p.Code
		, p.[Name]
		, p.PricePerUnit
		, ps.StockAuditSource
		, FORMAT(ps.DateCreated, 'yyyy-MM-dd')
)
GO
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
