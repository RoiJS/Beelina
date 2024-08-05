using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class AlterDailyDetailedTransactionsStoredProcedure_202407040641 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
migrationBuilder.Sql(@"
-- =============================================
-- Author:		Roi Larrence Amatong
-- Create date: 2023-11-13
-- Description:	Get Daily Detailed Transactions Report

-- Update By: Roi Larrence Amatong
-- Create date: 2024-07-04
-- Description:	Introduce TotalPaidAmount and TotalUnpaidAmount columns.
-- =============================================
-- exec Report_Daily_Detailed_Transactions @date = '2024-01-30', @userId = 3, @orderType = 2

ALTER PROCEDURE [dbo].[Report_Daily_Detailed_Transactions]
    @date VARCHAR(10) = NULL
	, @userId INT = 0
	, @orderType INT = 1
AS
BEGIN

	DECLARE @totalPaidAmount AS DECIMAL(10, 2)
	DECLARE @totalUnpaidAmount AS DECIMAL(10, 2)

	DECLARE @salesAgentName AS NVARCHAR(MAX)
	SET @salesAgentName = (SELECT CONCAT(u.FirstName, ' ', u.LastName) FROM UserAccounts u WHERE Id = @userId)

	DECLARE @ListResult AS TABLE (
		Id INT,
		StoreName NVARCHAR(MAX), 
		StoreAddress NVARCHAR(MAX), 
		OrderReceived DATETIME, 
		SalesAgentName NVARCHAR(MAX),
		AreaCovered NVARCHAR(MAX),
		OutletType INT,
		PaymentMethod NVARCHAR(MAX),
		ItemCode NVARCHAR(MAX),
		ItemName NVARCHAR(MAX),
		PricePerUnit DECIMAL(10, 2),
		Quantity INT,
		ReturnItems INT,
		Amount DECIMAL(10, 2),
		[OrderStatus] INT,
		PaidStatus INT,
		DateCreated DATETIME
	)

    -- (1) Report Header
	SELECT
		@salesAgentName AS SalesAgentName
		, @date AS [Date]

	;WITH ProductTransactionQuantityHistoryWithRowNumber AS (
		
		SELECT 
			ProductTransactionId
			, Quantity
			,ROW_NUMBER() OVER (PARTITION BY ProductTransactionId ORDER BY DateCreated DESC) AS RowNumber 
		FROM 
			ProductTransactionQuantityHistory
	)

	, PartitionedProductTransactionQuantityHistory AS (
		SELECT 
			ProductTransactionId
			, Quantity
		FROM 
			ProductTransactionQuantityHistoryWithRowNumber WHERE RowNumber = 1
	)

    -- (2) Report List details
    --=========================================================================================
	INSERT INTO @ListResult
    SELECT
        t.Id
        , s.[Name] AS StoreName
        , s.[Address] StoreAddress
        , CAST(t.TransactionDate AS DATETIME) AS OrderReceived
        , CONCAT(u.FirstName, ' ', u.LastName) SalesAgentName
        , b.[Name] AS AreaCovered
        , COALESCE(s.OutletType, 0) AS OutletType
		, pm.[Name] AS PaymentMethod

		, COALESCE(p.Code, '') AS ItemCode
		, COALESCE(p.[Name], '') AS ItemName
		, CAST(COALESCE(pt.Price, 0) AS DECIMAL(10, 2)) AS PricePerUnit
		, COALESCE(pt.Quantity, 0) AS Quantity
		, CASE WHEN COALESCE(pqh.Quantity, 0) - COALESCE(pt.Quantity, 0) <= 0 THEN 0 ELSE COALESCE(pqh.Quantity, 0) - COALESCE(pt.Quantity, 0) END AS ReturnItems
		, CAST(COALESCE(pt.Quantity, 0) * COALESCE(ROUND(pt.Price, 2), 0) AS DECIMAL(10, 2)) AS Amount
		, COALESCE(t.[Status], 0) AS [OrderStatus]
		, CASE WHEN  t.[Status] = 1 THEN 0 ELSE COALESCE(pt.[Status], 0) END AS [PaidStatus]

        , CAST(t.TransactionDate AS DATETIME) AS DateCreated
    FROM

        Transactions t 
		
		LEFT JOIN ProductTransactions pt
        ON t.Id = pt.TransactionId  

		LEFT JOIN Products p	
		ON p.Id = pt.ProductId

        LEFT JOIN Stores s
        ON s.Id = t.StoreId

		LEFT JOIN PaymentMethods pm
		ON pm.Id = s.PaymentMethodId

        LEFT JOIN Barangays b
        ON b.Id = s.BarangayId

        LEFT JOIN UserAccounts u
        ON u.Id = t.CreatedById

		LEFT JOIN PartitionedProductTransactionQuantityHistory pqh
		ON pqh.ProductTransactionId = pt.Id

    WHERE
        FORMAT(t.TransactionDate, 'yyyy-MM-dd') = @date
		AND t.CreatedById = @userId
		AND  t.[Status] = @orderType

	ORDER BY
		s.[Name]

	SELECT * FROM @ListResult


	-- (3) Calculate Paid and Unpaid Total Balances
	--===============================================================================================

	SELECT @totalPaidAmount = SUM(Amount) FROM @ListResult WHERE PaidStatus = 1
	SELECT @totalUnpaidAmount = SUM(Amount) FROM @ListResult WHERE PaidStatus = 0
	SELECT
		@totalPaidAmount AS TotalPaidAmount,
		@totalUnpaidAmount AS TotalUnpaidAmount
END
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
