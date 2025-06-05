using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class IntroducedReportEndingInventoryPerProductWarehouseModel3_20250602 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
-- =============================================
-- Author:		Amatong, Roi Larrence
-- Create date: 2025-05-28
-- Description:	Ending inventory data from warehouse business model 3 (#282)
-- =============================================
-- exec Report_Ending_Inventory_Per_Product_Warehouse_Model_3 @startDate = '2025-05-01', @endDate = '2025-05-31'
CREATE OR ALTER PROCEDURE [dbo].[Report_Ending_Inventory_Per_Product_Warehouse_Model_3]
	@startDate VARCHAR(10) = NULL
	, @endDate VARCHAR(10) = NULL
	, @userId INT = 0
	, @warehouseId INT = 1
AS
BEGIN
	
	;WITH PreviousStocksPerProduct AS (
		SELECT 
			ot.ProductId
			, ot.Code
			, ot.[Name]
			, SUM(ot.AbsoluteStocks) AS WithdrawnStocks
		FROM
			dbo.TVF_Product_Absolute_Stocks(0, @warehouseId) ot
		WHERE
			StockDate < CONVERT(DATE, @startDate) 
		GROUP BY
			ot.ProductId
			, ot.Code
			, ot.[Name]
	)

	,PreviousOrderTransactionsPerProduct AS (
		SELECT 
			ot.ProductId
			, ot.Code
			, ot.[Name]
			, SUM(ot.SoldQuantity) AS SoldQuantity
		FROM
			dbo.TVF_OrderTransactions(@userId, @warehouseId, 3) ot
		WHERE
			TransactionDate < CONVERT(DATE, @startDate) 
		GROUP BY
			ot.ProductId
			, ot.Code
			, ot.[Name]
	)

	, PreviousAbsoluteWarehouseStocksPerProduct AS (
		SELECT 
			pas.ProductId
			, pas.Code
			, pas.[Name]
			, pas.PricePerUnit
			, SUM(pas.AbsoluteStocks) AS Stock
		FROM 
			dbo.TVF_Warehouse_Product_Absolute_Stocks(@warehouseId) pas
		WHERE 
			StockDate < CONVERT(DATE, @startDate)
		GROUP BY 
			pas.ProductId
			, pas.Code
			, pas.[Name]
			, pas.PricePerUnit
	)

	, PreviousRemainingWarehouseStockPerProduct AS (
	
		SELECT 
			pp.ProductId
			, pp.Code
			, pp.[Name]
			, pp.PricePerUnit
			, (COALESCE(pp.Stock, 0) - COALESCE(pt.SoldQuantity, 0) - COALESCE(psp.WithdrawnStocks, 0)) AS RemainingStock
		FROM 
			PreviousAbsoluteWarehouseStocksPerProduct pp

			LEFT JOIN PreviousOrderTransactionsPerProduct pt
			ON pt.ProductId = pp.ProductId

			LEFT JOIN PreviousStocksPerProduct psp
			ON psp.ProductId = pp.ProductId
	)

	, CurrentStocksPerProduct AS (
		SELECT 
			ot.ProductId
			, ot.Code
			, ot.[Name]
			, SUM(ot.AbsoluteStocks) AS WithdrawnStocks
		FROM
			dbo.TVF_Product_Absolute_Stocks(0, @warehouseId) ot
		WHERE
			StockDate BETWEEN @startDate AND @endDate
		GROUP BY
			ot.ProductId
			, ot.Code
			, ot.[Name]
	)

	, CurrentOrderTransactionsPerProduct AS (
		SELECT 
			ot.ProductId
			, ot.Code
			, ot.[Name]
			, SUM(ot.SoldQuantity) AS SoldQuantity
		FROM
			dbo.TVF_OrderTransactions(@userId, @warehouseId, 3) ot
		WHERE
			TransactionDate BETWEEN @startDate AND @endDate
		GROUP BY
			ot.ProductId
			, ot.Code
			, ot.[Name]
	)

	, CurrentAbsoluteWarehouseStocksPerProduct AS (
		SELECT 
			pas.ProductId
			, pas.Code
			, pas.[Name]
			, pas.PricePerUnit
			, SUM(pas.AbsoluteStocks) AS Stock
		FROM 
			dbo.TVF_Warehouse_Product_Absolute_Stocks(@warehouseId) pas
		WHERE 
			StockDate BETWEEN @startDate AND @endDate
		GROUP BY 
			pas.ProductId
			, pas.Code
			, pas.[Name]
			, pas.PricePerUnit
	)

	, CurrentRemainingStockPerWarehouseProduct AS (
	
		SELECT 
			pt.ProductId
			, pt.Code
			, pt.[Name]
			, pp.PricePerUnit
			, (pp.Stock - pt.SoldQuantity - cpp.WithdrawnStocks) AS RemainingStock
		FROM 
			CurrentOrderTransactionsPerProduct pt

			LEFT JOIN CurrentAbsoluteWarehouseStocksPerProduct pp
			ON pt.ProductId = pp.ProductId

			LEFT JOIN CurrentStocksPerProduct cpp
			ON cpp.ProductId = pp.ProductId
	)

	, EndingStocksPerWarehouseProductReport AS (

		SELECT
			p.Id
			, p.Code
			, p.[Name]
			, pu.[Name] AS UnitName
			, (COALESCE(pp.RemainingStock, 0) + COALESCE(c.Stock, 0)) AS BeginningStocks
			, (COALESCE(pp.RemainingStock, 0) + COALESCE(c.Stock, 0)) * COALESCE(pw.PricePerUnit, 0) AS BeginningStocksValue
			, (COALESCE(pp.RemainingStock, 0) + COALESCE(c.Stock, 0) - COALESCE(cp.SoldQuantity, 0) - COALESCE(cs.WithdrawnStocks, 0)) AS EndingStocks
			, (COALESCE(pp.RemainingStock, 0) + COALESCE(c.Stock, 0) - COALESCE(cp.SoldQuantity, 0) - COALESCE(cs.WithdrawnStocks, 0)) * COALESCE(pw.PricePerUnit, 0) AS EndingStocksValue
			, COALESCE(cp.SoldQuantity, 0) AS SoldStocks
			, COALESCE(cp.SoldQuantity, 0) * COALESCE(pw.PricePerUnit, 0) AS SoldStocksValue
			, COALESCE(cs.WithdrawnStocks, 0) AS WithdrawnStocks
			, COALESCE(cs.WithdrawnStocks, 0) * COALESCE(pw.PricePerUnit, 0) AS WithdrawnStocksValue

		FROM

			Products p

			LEFT JOIN ProductStockPerPanels ps
			ON p.Id = ps.ProductId AND ps.UserAccountId = @userId

			LEFT JOIN ProductStockPerWarehouse pw
			ON p.Id = pw.ProductId

			LEFT JOIN PreviousRemainingWarehouseStockPerProduct pp
			ON pp.ProductId =  p.Id

			LEFT JOIN CurrentStocksPerProduct cs
			ON cs.ProductId = p.Id

			LEFT JOIN CurrentAbsoluteWarehouseStocksPerProduct c
			ON p.Id = c.ProductId 

			LEFT JOIN CurrentOrderTransactionsPerProduct cp
			ON cp.ProductId =  p.Id

			LEFT JOIN ProductUnits pu
			ON pu.Id = p.ProductUnitId
	)

	SELECT 
		ep.Code
		, CONCAT(ep.[Name],' : ',ep.UnitName) AS [Name]
		, ep.BeginningStocks
		, CAST(ep.BeginningStocksValue AS DECIMAL(10, 2)) AS BeginningStocksValue
		, ep.EndingStocks
		, CAST(ep.EndingStocksValue AS DECIMAL(10, 2)) AS EndingStocksValue
		, ep.WithdrawnStocks AS WithdrawnStocks
		, CAST(ep.WithdrawnStocksValue AS DECIMAL(10, 2)) AS WithdrawnStocksValue
		, ep.SoldStocks AS SoldStocks
		, CAST(ep.SoldStocksValue AS DECIMAL(10, 2)) AS SoldStocksValue
	FROM 
		EndingStocksPerWarehouseProductReport ep
	WHERE
		ep.BeginningStocks <> 0 and ep.EndingStocks <> 0
END	
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
