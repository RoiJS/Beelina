﻿using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class CreateSP_Report_Ending_Inventory_Per_Product_Panel_Model_1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
migrationBuilder.Sql(@"
-- =============================================
-- Author:		Amatong, Roi Larrence
-- Create date: 2024-04-11
-- Description:	Ending inventory data from panel
-- =============================================
CREATE OR ALTER   PROCEDURE [dbo].[Report_Ending_Inventory_Per_Product_Panel_Model_1]
	@startDate VARCHAR(10) = NULL
	, @endDate VARCHAR(10) = NULL
	, @userId INT = 0
	, @warehouseId INT = 1
	, @businessModel INT = 1
AS
BEGIN
	
	;WITH PreviousOrderTransactionsPerProduct AS (
		SELECT 
			ot.ProductId
			, ot.Code
			, ot.[Name]
			, SUM(ot.SoldQuantity) AS SoldQuantity
		FROM
			dbo.TVF_OrderTransactions(@userId, @warehouseId, @businessModel) ot
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
			dbo.TVF_Product_Absolute_Stocks(@userId, @warehouseId) pas
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
			pp.ProductId
			, pp.Code
			, pp.[Name]
			, pp.PricePerUnit
			, (COALESCE(pp.Stock, 0) - COALESCE(pt.SoldQuantity, 0)) AS RemainingStock
		FROM 
			PreviousAbsoluteStocksPerProduct pp

			LEFT JOIN PreviousOrderTransactionsPerProduct pt
			ON pt.ProductId = pp.ProductId
	)

	, CurrentOrderTransactionsPerProduct AS (
		SELECT 
			ot.ProductId
			, ot.Code
			, ot.[Name]
			, SUM(ot.SoldQuantity) AS SoldQuantity
		FROM
			dbo.TVF_OrderTransactions(@userId, @warehouseId, @businessModel) ot
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
			, pas.PricePerUnit
			, SUM(pas.AbsoluteStocks) AS Stock
		FROM 
			dbo.TVF_Product_Absolute_Stocks(@userId, @warehouseId) pas
		WHERE 
			StockDate BETWEEN @startDate AND @endDate
		GROUP BY 
			pas.ProductId
			, pas.Code
			, pas.[Name]
			, pas.PricePerUnit
	)

	, CurrentRemainingStockPerProduct AS (
	
		SELECT 
			pt.ProductId
			, pt.Code
			, pt.[Name]
			, pp.PricePerUnit
			, (pp.Stock - pt.SoldQuantity) AS RemainingStock
		FROM 
			CurrentOrderTransactionsPerProduct pt

			left join CurrentAbsoluteStocksPerProduct pp
			ON pt.ProductId = pp.ProductId
	)

	, EndingStocksPerProductReport AS (

		SELECT
			p.Id
			, p.Code
			, p.[Name]
			, pu.[Name] AS UnitName
			, (COALESCE(pp.RemainingStock, 0) + COALESCE(c.Stock, 0)) AS BeginningStocks
			, (COALESCE(pp.RemainingStock, 0) + COALESCE(c.Stock, 0)) * COALESCE(ps.PricePerUnit, 0) AS BeginningStocksValue
			, (COALESCE(pp.RemainingStock, 0) + COALESCE(c.Stock, 0) - COALESCE(cp.SoldQuantity, 0)) AS EndingStocks
			, (COALESCE(pp.RemainingStock, 0) + COALESCE(c.Stock, 0) - COALESCE(cp.SoldQuantity, 0)) * COALESCE(ps.PricePerUnit, 0) AS EndingStocksValue
			--, pp.PricePerUnit
			--, pp.RemainingStock
			--, c.Stock
			--, cp.SoldQuantity
			--, ppp.Stock AS PreviousAbsoluteStock
		FROM

			Products p

			LEFT JOIN ProductStockPerPanels ps
			ON p.Id = ps.ProductId

			LEFT JOIN CurrentAbsoluteStocksPerProduct c
			ON p.Id = c.ProductId 

			LEFT JOIN PreviousRemainingStockPerProduct pp
			ON pp.ProductId =  p.Id

			LEFT JOIN CurrentOrderTransactionsPerProduct cp
			ON cp.ProductId =  p.Id

			LEFT JOIN PreviousAbsoluteStocksPerProduct ppp
			ON ppp.ProductId =  p.Id

			LEFT JOIN ProductUnits pu
			ON pu.Id = p.ProductUnitId

		WHERE	
			ps.UserAccountId = @userId
	)

	SELECT 
		ep.Code
		, CONCAT(ep.[Name],' : ',ep.UnitName) AS [Name]
		, ep.BeginningStocks
		, CAST(ep.BeginningStocksValue AS DECIMAL(10, 2)) AS BeginningStocksValue
		, ep.EndingStocks
		, CAST(ep.EndingStocksValue AS DECIMAL(10, 2)) AS EndingStocksValue
		, (ep.BeginningStocks - ep.EndingStocks) AS SoldStocks
		, (CAST(ep.BeginningStocksValue AS DECIMAL(10, 2)) - CAST(ep.EndingStocksValue AS DECIMAL(10, 2))) AS SoldStocksValue
	FROM 
		EndingStocksPerProductReport ep
	WHERE
		ep.BeginningStocks <> 0 and ep.EndingStocks <> 0

END
GO
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
