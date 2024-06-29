using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class IntroduceCustomerDetailedTransactionsReportStoredProcedure : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
-- =============================================
-- Author:		Roi Larrence Amatong
-- Create date: 2024-06-28
-- Description:	Get Customers Daily Transaction Report
-- =============================================
-- EXEC Report_Customers_Daily_Transactions @date='2024-04-26', @salesAgentId='5', @userId='8', @orderType='2'
CREATE OR ALTER PROCEDURE [dbo].[Report_Customers_Daily_Transactions]
	@date VARCHAR(10) = NULL
	, @salesAgentId AS INT = 0
	, @userId INT = 0
	, @orderType INT = 1
AS
BEGIN
	
	DECLARE @salesAgentName AS NVARCHAR(MAX)
	SET @salesAgentName = (SELECT CONCAT(u.FirstName, ' ', u.LastName) FROM UserAccounts u WHERE Id = @salesAgentId)

	SELECT 
		@salesAgentName AS SalesAgentName
		, @date AS [Date],
		t.Id AS OrderId,
		t.InvoiceNo,
		s.Id AS StoreId,
		s.[Name],
		s.[Address],
		pm.[Name] AS PaymentMethod
	FROM 
		Transactions t 
		LEFT JOIN Stores s
		ON t.StoreId = s.Id

		LEFT JOIN PaymentMethods pm
		ON pm.Id = t.ModeOfPayment
	WHERE 
		FORMAT(t.TransactionDate, 'yyyy-MM-dd') = @date 
		AND t.[Status] <> 3 -- Not Bad Order
		AND t.CreatedById = @salesAgentId
	GROUP BY 
		t.Id,
		t.InvoiceNo,
		s.Id,
		s.[Name],
		s.[Address],
		pm.[Name]

	SELECT
        t.Id AS OrderId
		, COALESCE(p.Code, '') AS ItemCode
		, COALESCE(p.[Name], '') AS ItemName
		, COALESCE(pt.Quantity, 0) AS Quantity
		, CAST(COALESCE(pt.Price, 0) AS DECIMAL(10, 2)) AS PricePerUnit
		, CAST(COALESCE(pt.Quantity, 0) * COALESCE(ROUND(pt.Price, 2), 0) AS DECIMAL(10, 2)) AS Amount
    FROM

        Transactions t 
		
		LEFT JOIN ProductTransactions pt
        ON t.Id = pt.TransactionId  

		LEFT JOIN Products p	
		ON p.Id = pt.ProductId
    WHERE
        FORMAT(t.TransactionDate, 'yyyy-MM-dd') = @date
		AND t.CreatedById = @salesAgentId
		AND  t.[Status] = @orderType

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
