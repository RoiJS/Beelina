using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class AlterReport_Sales_Agent_Summary_Collection_StoredProcedure_202408080955 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
migrationBuilder.Sql(@"
-- =============================================
-- Author:		Roi Larrence Amatong
-- Create date: 2024-07-19
-- Description:	Get Sales Agent Summary Collection Report

-- Author:		Roi Larrence Amatong
-- Create date: 2024-08-08
-- Description:	Introduce Invoice Header
-- =============================================
-- EXEC Report_Sales_Agent_Summary_Collection @startDate='2024-01-01', @endDate = '2024-07-30', @salesAgentId=0, @userId=8
ALTER   PROCEDURE [dbo].[Report_Sales_Agent_Summary_Collection]
	@startDate VARCHAR(10) = NULL
	, @endDate VARCHAR(10) = NULL
	, @salesAgentId INT = 0
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
	DECLARE @agents AS TABLE(Id INT, FirstName NVARCHAR(MAX), LastName NVARCHAR(MAX))
	
	INSERT INTO @agents 
	SELECT 
		u.Id
		, u.FirstName 
		, u.LastName
	FROM 
		UserAccounts u
		LEFT JOIN UserPermission up
		ON u.Id = up.UserAccountId
	WHERE
		up.ModuleId = 1
		AND u.IsActive = 1
		AND u.IsDelete = 0
		AND up.PermissionLevel = 1
		AND ((@salesAgentId = 0 AND u.Id = u.Id) OR (@salesAgentId > 0 AND u.Id = @salesAgentId))

	SELECT 
		a.Id
		, a.FirstName
		, a.LastName
	FROM @agents a

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
		INNER JOIN  @agents a
		ON o.CreatedById = a.Id

	ORDER BY a.Id DESC

END
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
