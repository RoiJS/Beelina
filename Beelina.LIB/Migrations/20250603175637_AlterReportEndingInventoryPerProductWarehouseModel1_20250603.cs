using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class AlterReportEndingInventoryPerProductWarehouseModel1_20250603 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
migrationBuilder.Sql(@"
-- =============================================
-- Author:		Amatong, Roi Larrence
-- Create date: 2024-08-12
-- Description:	Ending inventory data from warehouse for Admin accounts
-- =============================================
-- exec Report_Ending_Inventory_Per_Product_Warehouse_Model_1 @startDate='2024-01-01', @endDate = '2024-08-30'
ALTER   PROCEDURE [dbo].[Report_Ending_Inventory_Per_Product_Warehouse_Model_1]
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
			, SUM(ot.AbsoluteStocks) AS AbsoluteStocks
		FROM
			dbo.TVF_Product_Absolute_Stocks(0, @warehouseId) ot
		WHERE
			StockDate < CONVERT(DATE, @startDate) 
			AND ot.StockAuditSource = 1 -- Withdrawal
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
			, (COALESCE(pp.Stock, 0) - COALESCE(pt.AbsoluteStocks, 0)) AS RemainingStock
		FROM 
			PreviousAbsoluteWarehouseStocksPerProduct pp

			LEFT JOIN PreviousStocksPerProduct pt
			ON pt.ProductId = pp.ProductId
	)

	, CurrentStocksPerProduct AS (
		SELECT 
			ot.ProductId
			, ot.Code
			, ot.[Name]
			, SUM(ot.AbsoluteStocks) AS AbsoluteStocks
		FROM
			dbo.TVF_Product_Absolute_Stocks(0, @warehouseId) ot
		WHERE
			StockDate BETWEEN @startDate AND @endDate
			AND ot.StockAuditSource = 1 -- Withdrawal
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
			, (pp.Stock - pt.AbsoluteStocks) AS RemainingStock
		FROM 
			CurrentStocksPerProduct pt

			LEFT JOIN CurrentAbsoluteWarehouseStocksPerProduct pp
			ON pt.ProductId = pp.ProductId
	)

	, EndingStocksPerWarehouseProductReport AS (

		SELECT
			p.Id
			, p.Code
			, p.[Name]
			, pu.[Name] AS UnitName
			, (COALESCE(pp.RemainingStock, 0) + COALESCE(c.Stock, 0)) AS BeginningStocks
			, (COALESCE(pp.RemainingStock, 0) + COALESCE(c.Stock, 0)) * COALESCE(pw.PricePerUnit, 0) AS BeginningStocksValue
			, (COALESCE(pp.RemainingStock, 0) + COALESCE(c.Stock, 0) - COALESCE(cp.AbsoluteStocks, 0)) AS EndingStocks
			, (COALESCE(pp.RemainingStock, 0) + COALESCE(c.Stock, 0) - COALESCE(cp.AbsoluteStocks, 0)) * COALESCE(pw.PricePerUnit, 0) AS EndingStocksValue
			--, pp.PricePerUnit
			--, pp.RemainingStock
			--, c.Stock
			--, cp.SoldQuantity
			--, ppp.Stock AS PreviousAbsoluteStock
		FROM

			Products p

			LEFT JOIN ProductStockPerWarehouse pw
			ON p.Id = pw.ProductId

			LEFT JOIN CurrentAbsoluteWarehouseStocksPerProduct c
			ON p.Id = c.ProductId 

			LEFT JOIN PreviousRemainingWarehouseStockPerProduct pp
			ON pp.ProductId =  p.Id

			LEFT JOIN CurrentStocksPerProduct cp
			ON cp.ProductId =  p.Id

			LEFT JOIN PreviousAbsoluteWarehouseStocksPerProduct ppp
			ON ppp.ProductId =  p.Id

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
		, (ep.BeginningStocks - ep.EndingStocks) AS WithdrawnStocks
		, (CAST(ep.BeginningStocksValue AS DECIMAL(10, 2)) - CAST(ep.EndingStocksValue AS DECIMAL(10, 2))) AS WithdrawnStocksValue
	FROM 
		EndingStocksPerWarehouseProductReport ep
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
