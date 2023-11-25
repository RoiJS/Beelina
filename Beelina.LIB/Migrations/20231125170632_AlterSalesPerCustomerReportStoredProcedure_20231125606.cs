using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
	public partial class AlterSalesPerCustomerReportStoredProcedure_20231125606 : Migration
	{
		protected override void Up(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.Sql(@"
-- =============================================
-- Author:		Roi Larrence Amatong
-- Create date: 2023-11-15
-- Description:	Create Sales Per Customer

-- Modified By:	Roi Larrence Amatong
-- Create date: 2023-11-16
-- Description:	Return only paid transactions

-- Modified By: Roi Larrence Amatong
-- Modified Date: 2022-11-26
-- Description: Introduced Bad Order when calculating the Net Amount
-- =============================================
-- EXEC Report_Sales_Per_Customer @date = '2023-11-25', @userId = 5

ALTER PROCEDURE [dbo].[Report_Sales_Per_Customer]
	@date VARCHAR(10) = NULL
	, @userId INT = 0
AS
BEGIN
	
	;WITH TransactionsPerCustomer AS (
		SELECT
			t.InvoiceNo
			, CAST(COALESCE(SUM(pt.Quantity * ROUND(pt.Price, 2)), 0) AS DECIMAL(10, 2)) AS GrossAmount
			, t.Discount
			, s.Id AS StoreId
			, s.[Name] AS StoreName
			, s.[Address] StoreAddress
		FROM

			Transactions t LEFT JOIN ProductTransactions pt
			ON t.Id = pt.TransactionId 
				
			LEFT JOIN Stores s
			ON s.Id = t.StoreId

		WHERE
			FORMAT(t.DateCreated, 'yyyy-MM-dd') = @date
			AND t.IsDelete = 0
			AND t.IsActive = 1
			AND t.CreatedById = @userId
			AND t.[Status] = 2 -- Confirmed Transaction
			AND pt.[Status] = 1 -- Paid Status

		GROUP BY
			t.InvoiceNo
			, t.Discount
			, s.Id
			, s.[Name]
			, s.[Address]
	)

	, DiscountedTransactionsPerCustomer AS (
		SELECT 
			 c.InvoiceNo
			, c.StoreId
			, c.StoreName
			, c.StoreAddress
			--, CAST(c.GrossAmount AS DECIMAL(10, 2)) AS GrossAmount
			, CAST(SUM(c.GrossAmount - ((c.Discount / 100) * c.GrossAmount)) AS DECIMAL(10, 2)) AS GrossAmount
		FROM 
			TransactionsPerCustomer c
		GROUP BY
			c.InvoiceNo
			, c.GrossAmount
			, c.Discount
			, c.StoreId
			, c.StoreName
			, c.StoreAddress
	)

	, BadOrders AS (
		SELECT 
			t.InvoiceNo
			, t.StoreId
			, t.Discount
			, SUM(COALESCE(pt.Quantity, 0) * ROUND(COALESCE(pt.Price, 0), 2)) AS Amount
		FROM
			Transactions t
			LEFT JOIN ProductTransactions pt
			ON pt.TransactionId = t.Id

		WHERE 
			t.[Status] = 3 -- Bad Order
			AND t.CreatedById = @userId
			AND t.IsDelete = 0
			AND t.IsActive = 1
			AND FORMAT(t.DateCreated, 'yyyy-MM-dd') = @date

		GROUP BY
			t.InvoiceNo
			, t.StoreId
			, t.Discount
	)

	, DiscountedBadOrdersPerCustomer AS (
		SELECT 
			c.InvoiceNo
			, c.StoreId
			, CAST(SUM(c.Amount - ((c.Discount / 100) * c.Amount)) AS DECIMAL(10, 2)) AS Amount
		FROM 
			BadOrders c
		GROUP BY
			c.InvoiceNo
			, c.StoreId
	)

	, SalesPerCustomer AS (
		SELECT 
			c.InvoiceNo
			, c.StoreId
			, c.StoreName
			, c.StoreAddress
			, c.GrossAmount AS GrossAmount
			, COALESCE(b.Amount, 0) AS BadOrder
			, (COALESCE(c.GrossAmount, 0) - COALESCE(b.Amount,0)) AS NetAmount
		FROM 
			DiscountedTransactionsPerCustomer c

			LEFT JOIN DiscountedBadOrdersPerCustomer b
			ON 
				c.InvoiceNo = b.InvoiceNo
				AND c.StoreId = b.StoreId
	)

	SELECT 
		s.InvoiceNo
		, s.StoreId
		, s.StoreName
		, s.StoreAddress
		, CAST(s.GrossAmount AS DECIMAL(10, 2)) AS GrossAmount
		, CAST(s.BadOrder AS DECIMAL(10,2)) AS BadOrder
		, CAST(s.NetAmount AS DECIMAL(10,2)) AS NetAmount
	FROM 
		SalesPerCustomer s

END
GO
");
		}

		protected override void Down(MigrationBuilder migrationBuilder)
		{

		}
	}
}
