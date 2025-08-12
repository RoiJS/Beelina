using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class AlterReportCustomersDailyTransactionsStoredProcedure_202508120741 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
migrationBuilder.Sql(@"
/****** Object:  StoredProcedure [dbo].[Report_Customers_Daily_Transactions]    Script Date: 8/12/2025 7:39:37 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO



-- =============================================
-- Author:		Roi Larrence Amatong
-- Create date: 2024-06-28
-- Description:	Get Customers Daily Transaction Report
-- =============================================
-- EXEC Report_Customers_Daily_Transactions @date='2025-08-09', @orderType='1', @invoiceNo = '', @salesAgentId='3', @userId='3'
-- EXEC Report_Customers_Daily_Transactions @date=NULL, @orderType=NULL, @invoiceNo = 'T2025072425', @salesAgentId='3', @userId='3'
ALTER   PROCEDURE [dbo].[Report_Customers_Daily_Transactions]
	@date VARCHAR(10) = NULL
	, @invoiceNo AS NVARCHAR(MAX) = NULL
	, @salesAgentId AS INT = 0
	, @userId INT = 0
	, @orderType INT = NULL
AS
BEGIN
	
	DECLARE @salesAgentName AS NVARCHAR(MAX)
	SET @salesAgentName = (SELECT CONCAT(u.FirstName, ' ', u.LastName) FROM UserAccounts u WHERE Id = @salesAgentId)
	DECLARE @FinalOrdersTable AS TABLE(OrderId INT, InvoiceNo NVARCHAR(MAX), TransactionDate NVARCHAR(MAX), Discount FLOAT, ModeOfPayment INT, [Status] INT, StoreId INT, ItemCode NVARCHAR(MAX), ItemName NVARCHAR(MAX), UnitName NVARCHAR(MAX), Quantity INT, PricePerUnit DECIMAL(10, 2), Amount DECIMAL(10, 2))
	
	;WITH Orders AS (
		SELECT
			t.Id AS OrderId
			, t.[InvoiceNo]
			, t.TransactionDate
			, t.Discount
			, t.[Status]
			, t.[StoreId]
			, t.ModeOfPayment
			, COALESCE(p.Code, '') AS ItemCode
			, COALESCE(p.[Name], '') AS ItemName
			, COALESCE(pu.[Name], '') AS UnitName
			, COALESCE(pt.Quantity, 0) AS Quantity
			, CAST(COALESCE(pt.Price, 0) AS DECIMAL(10, 2)) AS PricePerUnit
			, CAST(COALESCE(pt.Quantity, 0) * COALESCE(ROUND(pt.Price, 2), 0) AS DECIMAL(10, 2)) AS Amount
		FROM

			Transactions t 
		
			LEFT JOIN ProductTransactions pt
			ON t.Id = pt.TransactionId  

			LEFT JOIN Products p	
			ON p.Id = pt.ProductId

			LEFT JOIN ProductUnits pu
			ON pu.Id = p.ProductUnitId

		WHERE
			t.CreatedById = @salesAgentId
			AND (@invoiceNo IS NULL OR @invoiceNo = '' OR t.[InvoiceNo] LIKE '%' + @invoiceNo + '%')
	)
	
	INSERT INTO @FinalOrdersTable
	SELECT 
		OrderId
		, InvoiceNo
		, FORMAT(o.TransactionDate, 'yyyy-MM-dd') AS TransactionDate
		, Discount
		, ModeOfPayment
		, [Status]
		, StoreId
		, ItemCode
		, ItemName
		, UnitName
		, Quantity
		, PricePerUnit
		, Amount
	FROM 
		Orders o
	WHERE
		(@date IS NULL OR FORMAT(o.TransactionDate, 'yyyy-MM-dd') = @date)
		AND (@orderType IS NULL OR o.[Status] = @orderType)
	
	
	-- (1) Invoice Header
	--=========================================================================================================
	SELECT
		COALESCE(CompanyName, '') AS CompanyName
		, COALESCE(OwnerName, '') AS OwnerName
		, COALESCE([Address], '') AS [Address]
		, COALESCE(Telephone, '') AS Telephone
		, COALESCE(FaxTelephone, '') AS FaxTelephone
		, COALESCE(Tin, '') AS Tin
	FROM GeneralSettings

	-- (2) Report Header
	--=========================================================================================================
	SELECT 
		@salesAgentName AS SalesAgentName
		, t.TransactionDate AS [Date]
		, t.Discount
		, t.OrderId AS OrderId
		, t.InvoiceNo
		, s.Id AS StoreId
		, s.[Name]
		, s.[Address]
		, pm.[Name] AS PaymentMethod
	FROM 
		@FinalOrdersTable t 
		LEFT JOIN Stores s
		ON t.StoreId = s.Id

		LEFT JOIN PaymentMethods pm
		ON pm.Id = t.ModeOfPayment

	GROUP BY 
		t.OrderId,
		t.TransactionDate,
		t.Discount,
		t.InvoiceNo,
		s.Id,
		s.[Name],
		s.[Address],
		pm.[Name]

	-- (3) Report Details
	--=========================================================================================================
	SELECT 
		OrderId
		, ItemCode
		, ItemName
		, UnitName
		, Quantity
		, PricePerUnit
		, Amount
	FROM 
		@FinalOrdersTable

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
