using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    public partial class AlterReportDailyDetailedTransactions202312020701 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
-- =============================================
-- Author:		Roi Larrence Amatong
-- Create date: 2023-11-13
-- Description:	Get Daily Detailed Transactions Report
-- =============================================
-- exec Report_Daily_Detailed_Transactions @date = '2023-11-13', @userId = 1

ALTER PROCEDURE [dbo].[Report_Daily_Detailed_Transactions]
    @date VARCHAR(10) = NULL
	, @userId INT = 0
AS
BEGIN
    -- (1) Report List details
    --=========================================================================================
    SELECT
        t.Id
        , s.[Name] AS StoreName
        , s.[Address] StoreAddress
        , CAST(t.TransactionDate AS DATETIME) AS OrderReceived
        , CONCAT(u.FirstName, ' ', u.LastName) SalesAgentName
        , b.[Name] AS AreaCovered
        , COALESCE(s.OutletType, 0) AS OutletType
		, pm.[Name] AS PaymentMethod

		, COALESCE(p.Code, '') AS ItemCode
		, COALESCE(p.[Name], '') AS ItemName
		, CAST(COALESCE(pt.Price, 0) AS DECIMAL(10, 2)) AS PricePerUnit
		, COALESCE(pt.Quantity, 0) AS Quantity
		, CAST(COALESCE(pt.Quantity, 0) * COALESCE(ROUND(pt.Price, 2), 0) AS DECIMAL(10, 2)) AS Amount
		, COALESCE(pt.[Status], 0) AS [Status]

        , CAST(t.TransactionDate AS DATETIME) AS DateCreated
    FROM

        Transactions t LEFT JOIN ProductTransactions pt
        ON t.Id = pt.TransactionId 
            AND t.[Status] = 2 -- Confirmed Transaction

		LEFT JOIN Products p	
		ON p.Id = pt.ProductId

        LEFT JOIN Stores s
        ON s.Id = t.StoreId

		LEFT JOIN PaymentMethods pm
		ON pm.Id = s.PaymentMethodId

        LEFT JOIN Barangays b
        ON b.Id = s.BarangayId

        LEFT JOIN UserAccounts u
        ON u.Id = t.CreatedById

    WHERE
        FORMAT(t.TransactionDate, 'yyyy-MM-dd') = @date
		AND t.CreatedById = @userId
		
	ORDER BY
		s.[Name]
END
GO
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
