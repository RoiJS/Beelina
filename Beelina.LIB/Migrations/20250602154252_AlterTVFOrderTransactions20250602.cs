using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class AlterTVFOrderTransactions20250602 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
migrationBuilder.Sql(@"

-- Make sure to drop the existing function before creating a new one
DROP FUNCTION IF EXISTS [dbo].[TVF_OrderTransactions];
GO

-- =============================================
-- Author:		Roi Larrence Amatong
-- Create date: 2023-11-16
-- Description:	Return all transactions for all products

-- Modified By: Roi Larrence Amatong
-- Modified Date: 2025-06-02
-- Description: Introduced condition for Business Model 3 (#282)
-- =============================================
CREATE FUNCTION [dbo].[TVF_OrderTransactions]
(	
    @userId INT = 0,
    @warehouseId INT = 1,
    @businessModel INT = 1
)
RETURNS @result TABLE
(
    Id INT,
    ProductId INT,
    Code NVARCHAR(50),
    [Name] NVARCHAR(255),
    TransactionDate VARCHAR(10),
    SoldQuantity INT
)
AS
BEGIN 

    INSERT INTO @result
    SELECT
        t.Id
        , pt.ProductId
        , p.Code
        , p.[Name]
        , FORMAT(t.TransactionDate, 'yyyy-MM-dd') AS TransactionDate
        , SUM(pt.Quantity) as SoldQuantity
    FROM 
        Transactions t

        LEFT JOIN ProductTransactions pt
        ON t.Id = pt.TransactionId

        LEFT JOIN Products p
        ON p.Id = pt.ProductId

        LEFT JOIN UserAccounts u
        ON u.Id = t.CreatedById

    WHERE 
        (
            (@businessModel = 1 AND t.CreatedById = @userId) 
            OR (@businessModel = 2 AND t.CreatedById = t.CreatedById) 
            OR (@businessModel = 3 AND t.CreatedById = t.CreatedById AND u.SalesAgentType = 2) -- Warehouse Agents
        )
                        
        AND t.WarehouseId = @warehouseId
        AND t.[Status] = 2 -- Confirmed transaction
        AND t.IsDelete = 0
        AND t.IsActive = 1

    GROUP BY
        t.Id
        ,pt.ProductId
        , p.Code
        , p.[Name]
        , FORMAT(t.TransactionDate, 'yyyy-MM-dd')

    RETURN;

END
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
