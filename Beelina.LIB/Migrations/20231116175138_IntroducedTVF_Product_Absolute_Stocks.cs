using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    public partial class IntroducedTVF_Product_Absolute_Stocks : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                @"-- =============================================
-- Author:		Roi Larrence Amatong
-- Create date: 2023-11-16
-- Description: Return absolute stocks for all products
-- =============================================
CREATE FUNCTION [dbo].[TVF_Product_Absolute_Stocks] 
(	
	-- Add the parameters for the function here
	@userId INT = 0
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

		LEFT JOIN ProductStockPerPanels pp
		ON p.Id = pp.ProductId and pp.UserAccountId = @userId

		LEFT JOIN ProductStockAudits ps
		ON ps.ProductStockPerPanelId = pp.Id

	WHERE 
		p.IsDelete = 0
		AND p.IsActive = 1
		AND pp.IsDelete = 0
		AND pp.IsActive = 1
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
            migrationBuilder.Sql("DROP FUNCTION [dbo].[TVF_Product_Absolute_Stocks]");
        }
    }
}
