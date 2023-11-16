using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    public partial class AlterReportEndingInventoryPerProductStoredProcedure_20231116706 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
-- =============================================
-- Author:		Roi Larrence Amatong
-- Create date: 2023-11-15
-- Description:	Create Ending Inventory Per Product Report
-- =============================================
-- EXEC Report_Ending_Inventory_Per_Product @startDate = '2023-11-15', @endDate = '2023-11-20', @userId = 1

ALTER PROCEDURE [dbo].[Report_Ending_Inventory_Per_Product]
	@startDate VARCHAR(10) = NULL
	, @endDate VARCHAR(10) = NULL
	, @userId INT = 0
AS
BEGIN
	
	
	;WITH PreviousOrderTransactionsPerProduct AS (
		SELECT 
			ot.ProductId
			, ot.Code
			, ot.[Name]
			, SUM(ot.SoldQuantity) AS SoldQuantity
		FROM
			dbo.TVF_OrderTransactions(@userId) ot
		WHERE
			TransactionDate < CONVERT(DATE, @startDate) 
		GROUP BY
			ot.ProductId
			, ot.Code
			, ot.[Name]
	)

	, PreviousAbsoluteStocksPerProduct AS (
		SELECT 
			pas.ProductId
			, pas.Code
			, pas.[Name]
			, pas.PricePerUnit
			, SUM(pas.AbsoluteStocks) AS Stock
		FROM 
			dbo.TVF_Product_Absolute_Stocks(@userId) pas
		WHERE 
			StockDate < CONVERT(DATE, @startDate)
		GROUP BY 
			pas.ProductId
			, pas.Code
			, pas.[Name]
			, pas.PricePerUnit
	)

	, PreviousRemainingStockPerProduct AS (
	
		SELECT 
			pt.ProductId
			, pt.Code
			, pt.[Name]
			, pp.PricePerUnit
			, (pp.Stock - pt.SoldQuantity) AS RemainingStock
		FROM 
			PreviousOrderTransactionsPerProduct pt

			LEFT JOIN PreviousAbsoluteStocksPerProduct pp
			ON pt.ProductId = pp.ProductId
	)

	, CurrentOrderTransactionsPerProduct AS (
		SELECT 
			ot.ProductId
			, ot.Code
			, ot.[Name]
			, SUM(ot.SoldQuantity) AS SoldQuantity
		FROM
			dbo.TVF_OrderTransactions(@userId) ot
		WHERE
			TransactionDate BETWEEN @startDate AND @endDate
		GROUP BY
			ot.ProductId
			, ot.Code
			, ot.[Name]
	)

	, CurrentAbsoluteStocksPerProduct AS (
		SELECT 
			pas.ProductId
			, pas.Code
			, pas.[Name]
			, SUM(pas.AbsoluteStocks) AS Stock
		FROM 
			dbo.TVF_Product_Absolute_Stocks(@userId) pas
		WHERE 
			StockDate BETWEEN @startDate AND @endDate
		GROUP BY 
			pas.ProductId
			, pas.Code
			, pas.[Name]
	)

	, CurrentRemainingStockPerProduct AS (
	
		SELECT 
			pt.ProductId
			, pt.Code
			, pt.[Name]
			, (pp.Stock - pt.SoldQuantity) AS RemainingStock
		FROM 
			CurrentOrderTransactionsPerProduct pt

			left join CurrentAbsoluteStocksPerProduct pp
			ON pt.ProductId = pp.ProductId

	)

	, EndingStocksPerProductReport AS (

		SELECT
			pp.ProductId
			, pp.Code
			, pp.[Name]
			, (COALESCE(pp.RemainingStock, 0) + COALESCE(c.Stock, 0)) AS BeginningStocks
			, (COALESCE(pp.RemainingStock, 0) + COALESCE(c.Stock, 0)) * COALESCE(pp.PricePerUnit, 0) AS BeginningStocksValue
			, (COALESCE(pp.RemainingStock, 0) + COALESCE(c.Stock, 0) - COALESCE(cp.SoldQuantity, 0)) AS EndingStocks
			, (COALESCE(pp.RemainingStock, 0) + COALESCE(c.Stock, 0) - COALESCE(cp.SoldQuantity, 0)) * COALESCE(pp.PricePerUnit, 0) AS EndingStocksValue
			--, pp.PricePerUnit
			--, pp.RemainingStock
			--, c.Stock
			--, cp.SoldQuantity
			--, ppp.Stock AS PreviousAbsoluteStock
		FROM

			PreviousRemainingStockPerProduct pp

			LEFT JOIN CurrentAbsoluteStocksPerProduct c
			ON pp.ProductId = c.ProductId

			LEFT JOIN CurrentOrderTransactionsPerProduct cp
			ON cp.ProductId = pp.ProductId

			LEFT JOIN PreviousAbsoluteStocksPerProduct ppp
			ON pp.ProductId = ppp.ProductId

	)

	SELECT 
		ep.Code
		, ep.[Name]
		, ep.BeginningStocks
		, CAST(ep.BeginningStocksValue AS DECIMAL(10, 2)) AS BeginningStocksValue
		, ep.EndingStocks
		, CAST(ep.EndingStocksValue AS DECIMAL(10, 2)) AS EndingStocksValue
	FROM 
		EndingStocksPerProductReport ep

END
GO
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
