using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class IntroduceSPReport_Sales_Agent_Summary_Collection : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
migrationBuilder.Sql(@"

-- =============================================
-- Author:		Roi Larrence Amatong
-- Create date: 2024-07-21
-- Description:	Get Customer Summary Collection Report
-- =============================================
-- EXEC Report_Customer_Summary_Collection @startDate='2024-01-01', @endDate = '2024-07-30', @customerId=553, @userId=8
CREATE OR ALTER PROCEDURE [dbo].[Report_Customer_Summary_Collection]
	@startDate VARCHAR(10) = NULL
	, @endDate VARCHAR(10) = NULL
	, @customerId INT = 0
	, @warehouseId INT = 1
	, @userId INT = 0
AS
BEGIN

	-- (1) Sales Agents
	--=========================================================================================================
	DECLARE @customers AS TABLE(Id INT, [Name] NVARCHAR(MAX))
	
	INSERT INTO @customers 
	SELECT 
		s.Id
		, s.[Name]
	FROM 
		Stores s
	WHERE
		s.IsActive = 1
		AND s.IsDelete = 0
		AND ((@customerId = 0 AND s.Id = s.Id) OR (@customerId > 0 AND s.Id = @customerId))

	SELECT 
		c.Id
		, c.[Name]
	FROM 
		@customers c

	-- (2) Orders
	--=========================================================================================================
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
	FROM 
		dbo.TVF_OrderTransactionsWithAmounts(@warehouseId, @startDate, @endDate) o
		INNER JOIN  @customers c
		ON o.StoreId = c.Id

	ORDER BY c.Id DESC

END
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
