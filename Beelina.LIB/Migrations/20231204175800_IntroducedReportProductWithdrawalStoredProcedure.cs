using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    public partial class IntroducedReportProductWithdrawalStoredProcedure : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
-- ================================================
-- Template generated from Template Explorer using:
-- Create Procedure (New Menu).SQL
--
-- Use the Specify Values for Template Parameters 
-- command (Ctrl-Shift-M) to fill in the parameter 
-- values below.
--
-- This block of comments will not be included in
-- the definition of the procedure.
-- ================================================
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Roi Larrence Amatong
-- Create date: 2023-12-05
-- Description:	Product Withdrawal Report per sales agent
-- =============================================
-- exec Report_Product_Withdrawal @startDate = '2023-12-03', @endDate = '2023-12-05', @salesAgentId = 5

CREATE PROCEDURE Report_Product_Withdrawal 
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
		COALESCE(ps.WithdrawalSlipNo, '') AS WithdrawalSlipNo
		, p.Code AS ProductCode
		, p.Name AS ProductName
		, pu.Name AS ProductUnit
		, SUM(ps.Quantity) AS Quantity
	FROM 

		Products p

		LEFT JOIN ProductStockPerPanels pp
		ON p.Id = pp.ProductId

		LEFT JOIN ProductStockAudits ps
		ON pp.Id = ps.ProductStockPerPanelId

		LEFT JOIN ProductUnits pu
		ON p.ProductUnitId = pu.Id

	WHERE
		pp.UserAccountId = @salesAgentId
		AND p.IsActive = 1
		AND p.IsDelete = 0
		AND ps.IsActive = 1
		AND ps.IsDelete = 0
		AND FORMAT(ps.DateCreated, 'yyyy-MM-dd') BETWEEN CONVERT(DATE, @startDate) AND CONVERT(DATE, @endDate)
	GROUP BY
		ps.WithdrawalSlipNo 
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
