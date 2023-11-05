using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    public partial class CreateDailySummrizeTransactionsReportStoredProcedure : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                -- =============================================
                -- Author:		Roi Larrence Amatong
                -- Create date: 2023-11-03
                -- Description:	Get Daily Summarize Transactions Report
                -- =============================================

                CREATE PROCEDURE [dbo].[Report_Daily_Summarize_Transactions]
                    @date VARCHAR(10) = NULL
                    , @sortOrder INT = NULL
                AS
                BEGIN

                    -- (1) Report Summarize Header Info
                    ;WITH ProductsValueAmount AS (
                        SELECT 
                            SUM(ROUND(p.StockQuantity * p.PricePerUnit, 2)) AS Amount
                        FROM 
                            Products p 
                        WHERE 
                            IsDelete = 0 
                    )
                    , PurchasedValueAmount AS (
                        SELECT 
                            SUM(ROUND(pt.Quantity * pt.Price, 2)) AS Amount
                        FROM 
                            Transactions t LEFT JOIN ProductTransactions pt 
                            ON t.Id = pt.TransactionId
                        WHERE 
                            t.IsDelete = 0
                            AND pt.IsDelete = 0
                            AND t.[Status] = 2
                    )

                    SELECT 
                        CAST((p.Amount + pt.Amount) AS DECIMAL) AS InitialStocks
                        , CAST(p.Amount AS DECIMAL) AS AfterStocks
                        , CAST(pt.Amount AS DECIMAL) AS TotalSales
                    FROM 
                        ProductsValueAmount p
                        CROSS JOIN PurchasedValueAmount pt
                    



                    -- (2) Report List details
                    SELECT
                        t.Id
                        , CAST(COALESCE(SUM(pt.Quantity * ROUND(pt.Price, 2)), 0) AS DECIMAL) AS Collectibles
                        , '' AS DueCollectibles
                        , s.[Name] AS StoreName
                        , s.[Address] StoreAddress
                        , CAST(t.TransactionDate AS DATETIME) AS OrderReceived
                        , CONCAT(u.FirstName, ' ', u.LastName) SalesAgentName
                        , b.[Name] AS AreaCovered
                        , CAST(t.DateCreated AS DATETIME) AS DateCreated
                    FROM

                        Transactions t LEFT JOIN ProductTransactions pt
                        ON t.Id = pt.TransactionId 
                            AND t.[Status] = 2 -- Confirmed Transaction
                            AND pt.[Status] = 0 -- Paid Transaction Item

                        LEFT JOIN Stores s
                        ON s.Id = t.StoreId

                        LEFT JOIN Barangays b
                        ON b.Id = s.BarangayId

                        LEFT JOIN UserAccounts u
                        ON u.Id = t.CreatedById

                    WHERE
                        FORMAT(t.DateCreated, 'yyyy-MM-dd') = @date

                    GROUP BY
                        t.Id
                        , s.[Name]
                        , s.[Address]
                        , b.[Name]
                        , t.[TransactionDate]
                        , t.DateCreated
                        , u.FirstName
                        , u.LastName
                END
                GO

            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP PROCEDURE [dbo].[Report_Daily_Summarize_Transactions]");
        }
    }
}
