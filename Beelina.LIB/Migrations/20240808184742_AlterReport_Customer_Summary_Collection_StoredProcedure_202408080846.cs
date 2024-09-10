using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class AlterReport_Customer_Summary_Collection_StoredProcedure_202408080846 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
migrationBuilder.Sql(@"
-- =============================================
-- Author:		Roi Larrence Amatong
-- Create date: 2024-07-21
-- Description:	Get Customer Summary Collection Report

-- Author:		Roi Larrence Amatong
-- Create date: 2024-08-08
-- Description:	Introduce Invoice Header
-- =============================================
-- EXEC Report_Customer_Summary_Collection @startDate='2024-01-01', @endDate = '2024-07-30', @customerId=553, @userId=8
ALTER   PROCEDURE [dbo].[Report_Customer_Summary_Collection]
	@startDate VARCHAR(10) = NULL
	, @endDate VARCHAR(10) = NULL
	, @customerId INT = 0
	, @warehouseId INT = 1
	, @userId INT = 0
AS
BEGIN

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


	-- (2) Sales Agents
	--=========================================================================================================
	DECLARE @customers AS TABLE(Id INT, [Name] NVARCHAR(MAX), BarangayName NVARCHAR(MAX))
	
	INSERT INTO @customers 
	SELECT 
		s.Id
		, s.[Name]
		, b.[Name] AS BarangayName
	FROM 
		Stores s

		LEFT JOIN Barangays b
		ON s.BarangayId = b.Id

	WHERE
		s.IsActive = 1
		AND s.IsDelete = 0
		AND ((@customerId = 0 AND s.Id = s.Id) OR (@customerId > 0 AND s.Id = @customerId))

	SELECT 
		c.Id
		, c.[Name]
		, c.BarangayName
	FROM 
		@customers c

	-- (3) Orders
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
