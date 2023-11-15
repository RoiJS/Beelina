using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    public partial class AlterDailySummarizeTransactionsStoredProcedure_20231115836 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
migrationBuilder.Sql(@"
-- =============================================
-- Author:		Roi Larrence Amatong
-- Create date: 2023-11-03
-- Description:	Get Daily Summarize Transactions Report

-- Modified By: Roi Larrence Amatong
-- Modified Date: 2023-11-05
-- Description: Applied proper decimal precision on the amount values

-- Modified By: Roi Larrence Amatong
-- Modified Date: 2023-11-08
-- Description: Introduced filtering of transactions by user id

-- Modified By: Roi Larrence Amatong
-- Modified Date: 2023-11-09
-- Description: Introduced new columns outlet type and payment method from store details

-- Modified By: Roi Larrence Amatong
-- Modified Date: 2023-11-09
-- Description: Modified to support product pricing per panel

-- Modified By: Roi Larrence Amatong
-- Modified Date: 2023-11-15
-- Description: Modified to support calculation of discount value amounts
-- =============================================
-- exec Report_Daily_Summarize_Transactions @date = '2023-11-30', @userId = 1

ALTER PROCEDURE [dbo].[Report_Daily_Summarize_Transactions]
    @date VARCHAR(10) = NULL
    , @sortOrder INT = NULL
	, @userId INT = 0
AS
BEGIN

    -- (1) Report Summarize Header Info
    --=========================================================================================
    ;WITH ProductsValueAmount AS (
        SELECT 
            SUM(ROUND(COALESCE(pp.StockQuantity, 0) * pp.PricePerUnit, 2)) AS Amount
        FROM 
            Products p

			LEFT JOIN ProductStockPerPanels pp
			ON p.Id = pp.ProductId AND pp.UserAccountId = @userId
        WHERE 
            p.IsDelete = 0 
    )
	
	, PurchasedValueAmount AS (
        SELECT 
            SUM(ROUND(pt.Quantity * pt.Price, 2)) AS Amount
        FROM 
            Transactions t LEFT JOIN ProductTransactions pt 
            ON t.Id = pt.TransactionId
        WHERE 
            t.IsDelete = 0
            AND pt.IsDelete = 0
            AND t.[Status] = 2
			AND t.CreatedById = @userId
    )

    , PurchasedValueAmountPerTransaction AS (
        SELECT 
			t.Id
			, t.Discount
            , SUM(ROUND(pt.Quantity * pt.Price, 2)) AS Amount
        FROM 
            Transactions t LEFT JOIN ProductTransactions pt 
            ON t.Id = pt.TransactionId
        WHERE 
            t.IsDelete = 0
            AND pt.IsDelete = 0
            AND t.[Status] = 2
			AND t.CreatedById = @userId
		GROUP BY
			t.Id
			, t.Discount
    )
	, NetPurchasedValueAmount AS (
		SELECT 
			SUM(pt.Amount - ((pt.Discount / 100) * pt.Amount)) AS Amount
		FROM 
			PurchasedValueAmountPerTransaction pt
	)

    SELECT 
        CAST((p.Amount + pt.Amount) AS DECIMAL(10, 2)) AS InitialStocksValue
        , CAST(p.Amount AS DECIMAL(10, 2)) AS RemainingStocksValue
        , CAST(pt.Amount AS DECIMAL(10, 2)) AS TotalGrossSales
        , CAST((pt.Amount - np.Amount) AS DECIMAL(10, 2)) AS DiscountAmount
        , CAST(np.Amount AS DECIMAL(10, 2)) AS TotalNetSales
    FROM 
        ProductsValueAmount p
        CROSS JOIN PurchasedValueAmount pt
		CROSS JOIN NetPurchasedValueAmount np

    -- (2) Report List details
    --=========================================================================================
	;WITH CollectiblesPerTransactions AS (
		SELECT
			t.Id
			, CAST(COALESCE(SUM(pt.Quantity * ROUND(pt.Price, 2)), 0) AS DECIMAL(10, 2)) AS Collectibles
			, t.Discount
			, '' AS DueCollectibles
			, s.[Name] AS StoreName
			, s.[Address] StoreAddress
			, COALESCE(s.OutletType, 0) AS OutletType
			, pm.[Name] AS PaymentMethod
			, CAST(t.TransactionDate AS DATETIME) AS OrderReceived
			, CONCAT(u.FirstName, ' ', u.LastName) SalesAgentName
			, b.[Name] AS AreaCovered
			, CAST(t.DateCreated AS DATETIME) AS DateCreated
		FROM

			Transactions t LEFT JOIN ProductTransactions pt
			ON t.Id = pt.TransactionId 
				AND t.[Status] = 2 -- Confirmed Transaction
				AND pt.[Status] = 0 -- Paid Transaction Item

			LEFT JOIN Stores s
			ON s.Id = t.StoreId

			LEFT JOIN PaymentMethods pm
			ON pm.Id = s.PaymentMethodId

			LEFT JOIN Barangays b
			ON b.Id = s.BarangayId

			LEFT JOIN UserAccounts u
			ON u.Id = t.CreatedById

		WHERE
			--FORMAT(t.DateCreated, 'yyyy-MM-dd') = @date
			FORMAT(t.TransactionDate, 'yyyy-MM-dd') = @date
			AND t.CreatedById = @userId

		GROUP BY
			t.Id
			, t.Discount
			, s.[Name]
			, s.[Address]
			, b.[Name]
			, s.OutletType
			, pm.[Name]
			, t.[TransactionDate]
			, t.DateCreated
			, u.FirstName
			, u.LastName
	)

	, DiscountedCollectibles AS (
		SELECT 
			c.Id
			, c.Collectibles AS GrossCollectibles
			, c.Discount
			, SUM(c.Collectibles - ((c.Discount / 100) * c.Collectibles)) AS NetCollectibles
			, c.DueCollectibles
			, c.StoreName
			, c.StoreAddress
			, c.OutletType
			, c.PaymentMethod
			, c.OrderReceived
			, c.SalesAgentName
			, c.AreaCovered
			, c.DateCreated
		FROM 
			CollectiblesPerTransactions c
		GROUP BY
			c.Id
			, c.Collectibles
			, c.Discount
			, c.DueCollectibles
			, c.StoreName
			, c.StoreAddress
			, c.OutletType
			, c.PaymentMethod
			, c.OrderReceived
			, c.SalesAgentName
			, c.AreaCovered
			, c.DateCreated
	)

	SELECT 
		c.Id
		, c.GrossCollectibles
		, c.Discount
		, CAST((c.GrossCollectibles - c.NetCollectibles) AS DECIMAL(10, 2)) AS DiscountedCollectibles
		, c.NetCollectibles
		, c.DueCollectibles
		, c.StoreName
		, c.StoreAddress
		, c.OrderReceived
		, c.SalesAgentName
		, c.AreaCovered
		, c.OutletType
		, c.PaymentMethod
		, c.DateCreated
	FROM DiscountedCollectibles c
    
END
GO
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
