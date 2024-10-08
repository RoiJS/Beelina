﻿using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class CreateSP_Report_Ending_Inventory_Per_Product_Panel_Model_2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
migrationBuilder.Sql(@"
-- =============================================
-- Author:		Amatong, Roi Larrence
-- Create date: 2024-04-11
-- Description:	Ending inventory data from warehouse
-- =============================================
CREATE OR ALTER PROCEDURE [dbo].[Report_Ending_Inventory_Per_Product_Panel_Model_2]
	@startDate VARCHAR(10) = NULL
	, @endDate VARCHAR(10) = NULL
	, @userId INT = 0
	, @warehouseId INT = 1
	, @businessModel INT = 1
AS
BEGIN
	
	DECLARE @panelPrivileges AS INT = (SELECT PermissionLevel FROM UserPermission WHERE UserAccountId = @userId)

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
			, (COALESCE(pp.Stock, 0) - COALESCE(pt.SoldQuantity, 0)) AS RemainingStock
		FROM 
			PreviousAbsoluteWarehouseStocksPerProduct pp

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
			, (pp.Stock - pt.SoldQuantity) AS RemainingStock
		FROM 
			CurrentOrderTransactionsPerProduct pt

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
			, (COALESCE(pp.RemainingStock, 0) + COALESCE(c.Stock, 0)) * COALESCE((CASE WHEN @panelPrivileges > 1 THEN pw.PricePerUnit ELSE ps.PricePerUnit END), 0) AS BeginningStocksValue
			, (COALESCE(pp.RemainingStock, 0) + COALESCE(c.Stock, 0) - COALESCE(cp.SoldQuantity, 0)) AS EndingStocks
			, (COALESCE(pp.RemainingStock, 0) + COALESCE(c.Stock, 0) - COALESCE(cp.SoldQuantity, 0)) * COALESCE((CASE WHEN @panelPrivileges > 1 THEN pw.PricePerUnit ELSE ps.PricePerUnit END), 0) AS EndingStocksValue
			--, pp.PricePerUnit
			--, pp.RemainingStock
			--, c.Stock
			--, cp.SoldQuantity
			--, ppp.Stock AS PreviousAbsoluteStock
		FROM

			Products p

			LEFT JOIN ProductStockPerPanels ps
			ON p.Id = ps.ProductId AND ps.UserAccountId = @userId

			LEFT JOIN ProductStockPerWarehouse pw
			ON p.Id = pw.ProductId

			LEFT JOIN CurrentAbsoluteWarehouseStocksPerProduct c
			ON p.Id = c.ProductId 

			LEFT JOIN PreviousRemainingWarehouseStockPerProduct pp
			ON pp.ProductId =  p.Id

			LEFT JOIN CurrentOrderTransactionsPerProduct cp
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
		, (ep.BeginningStocks - ep.EndingStocks) AS SoldStocks
		, (CAST(ep.BeginningStocksValue AS DECIMAL(10, 2)) - CAST(ep.EndingStocksValue AS DECIMAL(10, 2))) AS SoldStocksValue
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
