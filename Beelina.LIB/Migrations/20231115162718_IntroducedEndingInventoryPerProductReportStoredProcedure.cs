using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    public partial class IntroducedEndingInventoryPerProductReportStoredProcedure : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
-- =============================================
-- Author:		Roi Larrence Amatong
-- Create date: 2023-11-15
-- Description:	Create Ending Inventory Per Product Report
-- =============================================
-- EXEC Report_Ending_Inventory_Per_Product @date = '2023-11-14', @userId = 1

CREATE PROCEDURE Report_Ending_Inventory_Per_Product
	@date VARCHAR(10) = NULL
	, @userId INT = 0
AS
BEGIN
	
	;WITH ProductsValueAmount AS (
        SELECT 
			p.Id
			, p.Code
			, p.[Name]
			, COALESCE(pp.StockQuantity, 0) AS StockQuantity
			, COALESCE(ROUND(pp.PricePerUnit, 0), 2) AS  PricePerUnit
            , ROUND(COALESCE(pp.StockQuantity, 0) * pp.PricePerUnit, 2) AS StockValue
        FROM 
            Products p

			LEFT JOIN ProductStockPerPanels pp
			ON p.Id = pp.ProductId AND pp.UserAccountId = @userId
        WHERE 
            p.IsDelete = 0 
			AND p.IsActive = 1
			AND pp.Id IS NOT NULL
			AND pp.UserAccountId = @userId
		GROUP BY
			p.Id
			, p.Code
			, p.[Name]
			, pp.StockQuantity
			, pp.PricePerUnit
    )
	
	, PurchasedValueAmount AS (
        SELECT 
			pt.ProductId
			, p.Code
			, SUM(pt.Quantity) AS Quantity
			, SUM(ROUND(COALESCE(pt.Price, 0), 2)) AS Price
            , SUM(pt.Quantity * ROUND(pt.Price, 2)) AS Amount
        FROM 
            Transactions t LEFT JOIN ProductTransactions pt 
            ON t.Id = pt.TransactionId
                AND t.[Status] = 2 -- Confirmed Transaction

			LEFT JOIN Products P
			ON p.Id = pt.ProductId
        WHERE 
            t.IsDelete = 0
            AND pt.IsDelete = 0
            AND t.[Status] = 2
			AND t.CreatedById = @userId
			AND FORMAT(t.DateCreated, 'yyyy-MM-dd') = @date
		GROUP BY
			pt.ProductId
			, p.Code
	)

	SELECT 
		pa.Id
		, pa.Code
		, pa.[Name]
		, (pa.StockQuantity + COALESCE(pv.Quantity, 0)) AS BeginningStocks
		, CAST(((pa.StockQuantity + COALESCE(pv.Quantity, 0)) * pa.PricePerUnit) AS DECIMAL(10, 2)) AS BeginningStocksValue
		, pa.StockQuantity AS EndingStocks
		, CAST(pa.StockValue AS DECIMAL(10,2)) AS EndingStocksValue
	FROM 
		ProductsValueAmount pa
		
		LEFT JOIN PurchasedValueAmount pv
		ON pa.Id = pv.ProductId
END
GO
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP PROCEDURE [dbo].[Report_Ending_Inventory_Per_Product]");
        }
    }
}
