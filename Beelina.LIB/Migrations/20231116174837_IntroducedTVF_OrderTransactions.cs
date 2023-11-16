using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    public partial class IntroducedTVF_OrderTransactions : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@" 
-- =============================================
-- Author:		Roi Larrence Amatong
-- Create date: 2023-11-16
-- Description:	Return all transactions for all products
-- =============================================
CREATE FUNCTION [dbo].[TVF_OrderTransactions]
(	
	@userId INT = 0
)
RETURNS TABLE 
AS
RETURN 
(
	SELECT
		t.Id
		, pt.ProductId
		, p.Code
		, p.[Name]
		, FORMAT(t.DateCreated, 'yyyy-MM-dd') AS TransactionDate
		, SUM(pt.Quantity) as SoldQuantity
	FROM 
		Transactions t

		LEFT JOIN ProductTransactions pt
		ON t.Id = pt.TransactionId

		LEFT JOIN Products p
		ON p.Id = pt.ProductId

	WHERE 
		t.CreatedById = @userId
		AND t.[Status] = 2 -- Confirmed transaction
		AND t.IsDelete = 0
		AND t.IsActive = 1
		AND p.IsDelete = 0
		AND p.IsActive = 1

	GROUP BY
		t.Id
		,pt.ProductId
		, p.Code
		, p.[Name]
		, FORMAT(t.DateCreated, 'yyyy-MM-dd')
)
GO
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP FUNCTION [dbo].[TVF_OrderTransactions]");
        }
    }
}
