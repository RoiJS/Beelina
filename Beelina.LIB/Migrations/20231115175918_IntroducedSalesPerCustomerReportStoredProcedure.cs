using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    public partial class IntroducedSalesPerCustomerReportStoredProcedure : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
-- =============================================
-- Author:		Roi Larrence Amatong
-- Create date: 2023-11-15
-- Description:	Create Sales Per Customer
-- =============================================
-- EXEC Report_Sales_Per_Customer @date = '2023-11-14', @userId = 1

CREATE PROCEDURE [dbo].[Report_Sales_Per_Customer]
	@date VARCHAR(10) = NULL
	, @userId INT = 0
AS
BEGIN
	
	;WITH TransactionsPerCustomer AS (
		SELECT
			t.Id
			, t.InvoiceNo
			, CAST(COALESCE(SUM(pt.Quantity * ROUND(pt.Price, 2)), 0) AS DECIMAL(10, 2)) AS GrossAmount
			, t.Discount
			, s.[Name] AS StoreName
			, s.[Address] StoreAddress
		FROM

			Transactions t LEFT JOIN ProductTransactions pt
			ON t.Id = pt.TransactionId 
				AND t.[Status] = 2 -- Confirmed Transaction

			LEFT JOIN Stores s
			ON s.Id = t.StoreId

		WHERE
			FORMAT(t.DateCreated, 'yyyy-MM-dd') = @date
			AND t.CreatedById = @userId

		GROUP BY
			t.Id
			, t.InvoiceNo
			, t.Discount
			, s.[Name]
			, s.[Address]
	)

	, DiscountedTransactionsPerCustomer AS (
		SELECT 
			c.Id
			, c.InvoiceNo
			, c.StoreName
			, c.StoreAddress
			--, CAST(c.GrossAmount AS DECIMAL(10, 2)) AS GrossAmount
			, CAST(SUM(c.GrossAmount - ((c.Discount / 100) * c.GrossAmount)) AS DECIMAL(10, 2)) AS GrossAmount
		FROM 
			TransactionsPerCustomer c
		GROUP BY
			c.Id
			, c.InvoiceNo
			, c.GrossAmount
			, c.Discount
			, c.StoreName
			, c.StoreAddress
	)

	SELECT 
		c.Id
		, c.InvoiceNo
		, c.StoreName
		, c.StoreAddress
		, CAST(c.GrossAmount AS DECIMAL(10, 2)) AS GrossAmount
		, CAST(0 AS DECIMAL(10, 2)) AS BadOrder
		, CAST(c.GrossAmount AS DECIMAL(10, 2)) AS NetAmount
	FROM DiscountedTransactionsPerCustomer c
END
GO
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP PROCEDURE [dbo].[Report_Sales_Per_Customer]");
        }
    }
}
