using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class Create_Report_Supplier_Product_Transactions_StoredProcedure_20250825 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
-- =============================================
-- Author:		Roi Larrence Amatong
-- Create date: 2025-08-25
-- Description:	Supplier Product Transactions Report
-- =============================================
-- exec Report_Supplier_Product_Transactions @supplierId = 1, @orderType = 2, @startDate = '2025-07-01', @endDate = '2025-08-25', @userId = 1

CREATE PROCEDURE [dbo].[Report_Supplier_Product_Transactions]
    @supplierId INT = 0,
    @orderType INT = 0,
    @startDate VARCHAR(10) = NULL,
    @endDate VARCHAR(10) = NULL,
    @userId INT = 0
AS
BEGIN
    DECLARE @supplierName AS NVARCHAR(MAX)
    DECLARE @orderStatusName AS NVARCHAR(MAX)
    DECLARE @userFullName AS NVARCHAR(MAX)

    SET @supplierName = CASE 
                            WHEN @supplierId = 0 THEN 'All Suppliers' 
                            ELSE COALESCE((SELECT [Name] FROM Suppliers WHERE Id = @supplierId), 'Unknown Supplier')
                        END

    SET @orderStatusName = CASE @orderType
                                WHEN 0 THEN 'All'
                                WHEN 1 THEN 'Pre-book'
                                WHEN 2 THEN 'Confirmed' 
                                WHEN 3 THEN 'Bad Order'
                                ELSE 'All'
                           END

    SET @userFullName = COALESCE((SELECT CONCAT(FirstName, ' ', LastName) FROM UserAccounts WHERE Id = @userId), '')

    -- (1) Invoice Header
    --=========================================================================================================
    SELECT
        COALESCE(CompanyName, '') AS CompanyName,
        COALESCE(OwnerName, '') AS OwnerName,
        COALESCE([Address], '') AS [Address],
        COALESCE(Telephone, '') AS Telephone,
        COALESCE(FaxTelephone, '') AS FaxTelephone,
        COALESCE(Tin, '') AS Tin,
        @userFullName AS UserFullName
    FROM GeneralSettings

    -- (2) Report Header
    --=========================================================================================================
    SELECT 
        @supplierName AS SupplierName,
        @startDate AS FromDate,
        @endDate AS ToDate,
        @orderStatusName AS OrderStatusFilter

    -- (3) Report Details
    --=========================================================================================================
    SELECT 
        t.TransactionDate,
        CONCAT(u.FirstName, ' ', u.LastName) AS SalesAgentName,
        COALESCE(s.OutletType, 0) AS OutletType,
        s.[Name] AS StoreName,
        b.[Name] AS BarangayName,
        p.[Name] AS ProductDescription,
        pt.Quantity,
        pu.[Name] AS UnitName,
        CAST(pt.Price AS DECIMAL(10, 2)) AS PricePerUnit,
        CAST(pt.Quantity * ROUND(pt.Price, 2) AS DECIMAL(10, 2)) AS Amount
    FROM 
        Transactions t
        INNER JOIN ProductTransactions pt ON t.Id = pt.TransactionId
        INNER JOIN Products p ON pt.ProductId = p.Id
        LEFT JOIN ProductUnits pu ON p.ProductUnitId = pu.Id
        LEFT JOIN Suppliers sup ON p.SupplierId = sup.Id
        LEFT JOIN Stores s ON t.StoreId = s.Id
        LEFT JOIN Barangays b ON s.BarangayId = b.Id
        LEFT JOIN UserAccounts u ON t.CreatedById = u.Id
    WHERE
        (@startDate IS NULL OR FORMAT(t.TransactionDate, 'yyyy-MM-dd') >= @startDate)
        AND (@endDate IS NULL OR FORMAT(t.TransactionDate, 'yyyy-MM-dd') <= @endDate)
        AND (@supplierId = 0 OR sup.Id = @supplierId)
        AND (@orderType = 0 OR t.[Status] = @orderType)
        AND t.IsDelete = 0
        AND t.IsActive = 1
        AND pt.IsDelete = 0
        AND pt.IsActive = 1
    ORDER BY
        t.TransactionDate ASC,
        u.FirstName,
        u.LastName,
        s.[Name],
        p.[Name]
END
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP PROCEDURE [dbo].[Report_Supplier_Product_Transactions]");
        }
    }
}
