﻿using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class AlterSPReport_Product_Withdrawal_20250728 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
-- =============================================
-- Author:		Roi Larrence Amatong
-- Create date: 2023-12-05
-- Description:	Product Withdrawal Report per sales agent

-- Modified By: Roi Larrence Amatong
-- Modified Date: 2023-12-11
-- Description: Make sure to only get info from Withdrawal action

-- Modified By: Roi Larrence Amatong
-- Modified Date: 2025-03-26
-- Description: Joined table ProductWithdrawalEntries to get withdrawal slip no
-- =============================================
-- exec Report_Product_Withdrawal @startDate = '2025-03-03', @endDate = '2025-03-31', @salesAgentId = 3

ALTER PROCEDURE [dbo].[Report_Product_Withdrawal] 
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
        COALESCE(ps.WithdrawalSlipNo, COALESCE(pw.WithdrawalSlipNo, '')) AS WithdrawalSlipNo
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

        LEFT JOIN ProductWithdrawalEntries pw
        ON pw.Id = ps.ProductWithdrawalEntryId

        LEFT JOIN ProductUnits pu
        ON p.ProductUnitId = pu.Id

    WHERE
        pp.UserAccountId = @salesAgentId
        AND p.IsActive = 1
        AND p.IsDelete = 0
        AND ps.IsActive = 1
        AND ps.IsDelete = 0
        AND ps.StockAuditSource = 1 -- From Withdrawal
        AND FORMAT(pw.StockEntryDate, 'yyyy-MM-dd') BETWEEN CONVERT(DATE, @startDate) AND CONVERT(DATE, @endDate)
    GROUP BY
        ps.WithdrawalSlipNo 
        , pw.WithdrawalSlipNo
        , p.Code
        , p.Name
        , pu.Name
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
