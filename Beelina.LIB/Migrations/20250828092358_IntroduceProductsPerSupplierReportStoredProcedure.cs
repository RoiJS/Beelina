using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class IntroduceProductsPerSupplierReportStoredProcedure : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
-- =============================================
-- Author:		Roi Larrence Amatong
-- Create date: 2025-08-27
-- Description:	Get Products per Supplier Report
-- =============================================
-- EXEC Report_Products_Per_Supplier @supplierId=1, @activeStatus=1, @userId=1
CREATE OR ALTER   PROCEDURE [dbo].[Report_Products_Per_Supplier]
	@supplierId INT = NULL
	, @activeStatus INT = 1
	, @userId INT = 0
AS
BEGIN
	
	DECLARE @currentUser AS NVARCHAR(MAX)
	SET @currentUser = COALESCE((SELECT CONCAT(FirstName, ' ', LastName) FROM UserAccounts WHERE Id = @userId), '')

	-- (1) Invoice Header
	--=========================================================================================================
	SELECT
		COALESCE(CompanyName, '') AS CompanyName
		, COALESCE(OwnerName, '') AS OwnerName
		, COALESCE([Address], '') AS [Address]
		, COALESCE(Telephone, '') AS Telephone
		, COALESCE(FaxTelephone, '') AS FaxTelephone
		, COALESCE(Tin, '') AS Tin
		, @currentUser AS UserFullName
	FROM GeneralSettings

	-- (2) Report Details
	--=========================================================================================================
	SELECT
        COALESCE(s.[Name], '') AS SupplierName
        , COALESCE(p.Code, '') AS ProductCode
		, CASE 
			WHEN (GETDATE() < p.ValidFrom OR (p.ValidTo IS NOT NULL AND GETDATE() > p.ValidTo)) 
			THEN COALESCE(p.[Name], '') + ' (Inactive)'
			ELSE COALESCE(p.[Name], '')
		  END AS ProductDescription
		, COALESCE(pu.[Name], '') AS Unit
		, CAST(COALESCE(psw.PricePerUnit, 0) AS DECIMAL(10, 2)) AS PricePerUnit
	FROM
		Products p
		
		LEFT JOIN ProductUnits pu
		ON p.ProductUnitId = pu.Id
		
		LEFT JOIN ProductStockPerWarehouse psw
		ON p.Id = psw.ProductId
		
		LEFT JOIN Suppliers s
		ON p.SupplierId = s.Id
		
	WHERE
		(@supplierId IS NULL OR p.SupplierId = @supplierId)
		AND p.IsDelete = 0
		AND (@activeStatus = 0 OR (@activeStatus = 1 AND GETDATE() >= p.ValidFrom AND (p.ValidTo IS NULL OR GETDATE() <= p.ValidTo)))
		AND s.IsActive = 1
		AND s.IsDelete = 0
	ORDER BY s.[Name], p.[Name]
END
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
           migrationBuilder.Sql(@"DROP PROCEDURE IF EXISTS [dbo].[Report_Products_Per_Supplier]");
        }
    }
}
