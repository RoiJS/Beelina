using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class IntroduceTVF_OrderTransactionsWithAmounts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
migrationBuilder.Sql(@"
-- =============================================
-- Author:		Amatong, Roi Larrence
-- Create date: 2024-07-29
-- Description:	Net Amount per order transactions
-- =============================================
-- SELECT * FROM dbo.TVF_OrderTransactionsWithAmounts(1, '2024-01-01', '2024-07-30')
CREATE OR ALTER FUNCTION [dbo].[TVF_OrderTransactionsWithAmounts]
(
	@warehouseId INT = 1,
	@startDate DATE = NULL,
	@endDate DATE = NULL
)
RETURNS TABLE
AS 
RETURN
(
	
	WITH OrderTransactions AS (
		SELECT
			t.[Id]
			, t.InvoiceNo
			, t.TransactionDate
			, CAST(COALESCE(SUM(pt.Quantity * ROUND(pt.Price, 2)), 0) AS DECIMAL(10, 2)) AS GrossAmount
			, t.Discount
			, t.StoreId 
			, t.CreatedById
			, pt.[Status]
		FROM

			Transactions t LEFT JOIN ProductTransactions pt
			ON t.Id = pt.TransactionId

		WHERE
			FORMAT(t.TransactionDate, 'yyyy-MM-dd') BETWEEN @startDate AND @endDate
			AND t.IsDelete = 0
			AND t.IsActive = 1
			AND (t.[Status] = 1 OR t.[Status] = 2) -- Confirmed Transaction
			--AND pt.[Status] = 1 -- Paid Status

		GROUP BY
			t.[Id]
			, t.InvoiceNo
			, t.TransactionDate
			, t.[Status]
			, t.Discount
			, t.StoreId 
			, t.CreatedById
			, pt.[Status]
	)

	, DiscountedOrderTransactions AS (
		SELECT 
			c.Id
			, c.InvoiceNo
			, c.TransactionDate
			--, CAST(c.GrossAmount AS DECIMAL(10, 2)) AS GrossAmount
			, CAST(SUM(c.GrossAmount - ((c.Discount / 100) * c.GrossAmount)) AS DECIMAL(10, 2)) AS GrossAmount
			, c.[Status]
			, c.StoreId 
			, c.CreatedById
		FROM 
			OrderTransactions c
		GROUP BY
			c.Id
			, c.InvoiceNo
			, c.TransactionDate
			, c.GrossAmount
			, c.Discount
			, c.[Status]
			, c.StoreId 
			, c.CreatedById
	)

	, BadOrders AS (
		SELECT 
			t.Id
			, t.InvoiceNo
			, t.TransactionDate
			, t.Discount
			, SUM(COALESCE(pt.Quantity, 0) * ROUND(COALESCE(pt.Price, 0), 2)) AS Amount
			, t.StoreId 
			, t.CreatedById
		FROM
			Transactions t
			LEFT JOIN ProductTransactions pt
			ON pt.TransactionId = t.Id

		WHERE 
			t.[Status] = 3 -- Bad Order
			AND t.IsDelete = 0
			AND t.IsActive = 1
			AND FORMAT(t.TransactionDate, 'yyyy-MM-dd') BETWEEN @startDate AND @endDate

		GROUP BY
			t.Id
			, t.InvoiceNo
			, t.TransactionDate
			, t.Discount
			, t.StoreId 
			, t.CreatedById
	)

	, DiscountedBadOrdersPerCustomer AS (
		SELECT 
			c.Id
			, c.InvoiceNo
			, c.TransactionDate
			, c.StoreId
			, CAST(SUM(c.Amount - ((c.Discount / 100) * c.Amount)) AS DECIMAL(10, 2)) AS Amount
			, c.CreatedById
		FROM 
			BadOrders c
		GROUP BY
			c.Id
			, c.InvoiceNo
			, c.TransactionDate
			, c.StoreId
			, c.CreatedById
	),

	OrderTransactionsWithAmount AS (
		SELECT 
			c.Id
			, c.InvoiceNo
			, c.TransactionDate
			, c.GrossAmount AS GrossAmount
			, COALESCE(b.Amount, 0) AS BadOrder
			, (COALESCE(c.GrossAmount, 0) - COALESCE(b.Amount,0)) AS NetAmount
			, c.[Status]
			, c.StoreId 
			, c.CreatedById
		FROM 
			DiscountedOrderTransactions c

			LEFT JOIN DiscountedBadOrdersPerCustomer b
			ON 
				c.InvoiceNo = b.InvoiceNo
				AND c.StoreId = b.StoreId
	),

	OrderTransactionWithPayments AS (
	
		SELECT 
			o.Id
			, o.InvoiceNo
			, o.TransactionDate
			, o.GrossAmount
			, o.BadOrder
			, o.NetAmount
			, o.[Status]
			, o.StoreId
			, o.CreatedById
			, CAST(COALESCE(SUM(p.Amount), 0)  AS DECIMAL(10, 2)) AS Payments
			, CAST(o.NetAmount - COALESCE(SUM(p.Amount), 0) AS DECIMAL(10, 2)) AS Balance
		FROM 

			OrderTransactionsWithAmount o
			LEFT JOIN  Payments p
			ON o.Id = p.TransactionId

		WHERE 
			p.Id IS NULL OR (
			p.IsActive = 1
			AND p.IsDelete = 0)

		GROUP BY
			o.Id
			, o.InvoiceNo
			, o.TransactionDate
			, o.GrossAmount
			, o.BadOrder
			, o.NetAmount
			, o.[Status]
			, o.StoreId
			, o.CreatedById
	)

	SELECT 
		o.Id
		, o.InvoiceNo
		, o.TransactionDate
		, o.GrossAmount
		, o.BadOrder
		, o.NetAmount
		, o.[Status]
		, o.StoreId
		, o.CreatedById
		, o.Payments
		, o.Balance
	FROM OrderTransactionWithPayments o
)
GO
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
