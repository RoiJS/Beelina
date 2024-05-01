using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    public partial class IntroducedSPReport_Product_Withdrawal_2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
-- =============================================
-- Author:		Roi Larrence Amatong
-- Create date: 2024-04-15
-- Description:	Product Withdrawal Report for Business model 2
-- =============================================
-- exec Report_Product_Withdrawal_2 @startDate = '2024-04-14', @endDate = '2024-04-14', @salesAgentId = 5

CREATE OR ALTER PROCEDURE [dbo].[Report_Product_Withdrawal_2] 
	@startDate VARCHAR(10) = NULL
	, @endDate VARCHAR(10) = NULL
	, @salesAgentId INT = 0
	, @userId INT = 0
AS
BEGIN

	DECLARE @salesAgentName AS NVARCHAR(MAX)
	SET @salesAgentName = (SELECT CONCAT(u.FirstName, ' ', u.LastName) FROM UserAccounts u WHERE Id = @salesAgentId)

    -- (1) Report Header
	SELECT
		@salesAgentName AS SalesAgentName
		, @startDate AS FromDate
		, @endDate AS ToDate
	
    -- (2) Report Table results
	SELECT  
		t.InvoiceNo AS InvoiceNo
		, p.Code AS ProductCode
		, p.Name AS ProductName
		, pu.Name AS ProductUnit
		, SUM(pt.Quantity) AS Quantity
	FROM 
		Transactions t

		LEFT JOIN ProductTransactions pt
		ON t.Id = pt.TransactionId

		LEFT JOIN  Products p
		ON p.Id = pt.ProductId

		LEFT JOIN ProductUnits pu
		ON p.ProductUnitId = pu.Id

	WHERE
		t.CreatedById = @salesAgentId
		AND t.IsActive = 1
		AND t.IsDelete = 0
		AND pt.IsActive = 1
		AND pt.IsDelete = 0
		AND FORMAT(t.TransactionDate, 'yyyy-MM-dd') BETWEEN CONVERT(DATE, @startDate) AND CONVERT(DATE, @endDate)
	GROUP BY
		t.InvoiceNo 
		, p.Code
		, p.Name
		, pu.Name

END
GO
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
