using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class IntroducePurchaseOrderReportStoredProcedure : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
-- =============================================
-- Author:		Roi Larrence Amatong
-- Create date: 2025-08-20
-- Description:	Get Purchase Order Report
-- =============================================
-- EXEC Report_Purchase_Orders @purchaseOrderReferenceNo='PO-0001', @startDate='2025-03-20', @endDate='2025-03-20', @warehouseId=1, @supplierId=1
CREATE OR ALTER   PROCEDURE [dbo].[Report_Purchase_Orders]
	@purchaseOrderReferenceNo VARCHAR(MAX) = NULL
	, @startDate VARCHAR(10) = NULL
	, @endDate VARCHAR(10) = NULL
	, @warehouseId INT = 1
	, @supplierId INT = NULL
	, @userId INT = 0
AS
BEGIN
	
	DECLARE @warehouseName AS NVARCHAR(MAX)
	SET @warehouseName = (SELECT [Name] FROM Warehouses WHERE Id = @warehouseId)
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

	-- (2) Report Header
	--=========================================================================================================
	SELECT 
		@warehouseName AS WarehouseName
		, @startDate AS FromDate
		, @endDate AS ToDate
		, pore.Id AS PurchaseOrderId
		, pore.ReferenceNo
		, FORMAT(pore.StockEntryDate, 'yyyy-MM-dd') AS StockEntryDate
		, COALESCE(pore.InvoiceNo, '') AS InvoiceNo
		, COALESCE(FORMAT(pore.InvoiceDate, 'yyyy-MM-dd'), '') AS InvoiceDate
		, COALESCE(s.[Name], '') AS SupplierName
		, COALESCE(pore.PlateNo, '') AS PlateNo
		, CAST(pore.Discount AS DECIMAL(10, 2)) AS Discount
		, COALESCE(pore.Notes, '') AS Notes
		, COALESCE(pore.[Location], '') AS [Location]
		, pore.[PurchaseOrderStatus]
	FROM 
		ProductWarehouseStockReceiptEntries pore
		LEFT JOIN Suppliers s ON pore.SupplierId = s.Id
	WHERE 
		pore.WarehouseId = @warehouseId
		AND pore.IsActive = 1
		AND pore.IsDelete = 0
		AND (@startDate IS NULL OR pore.StockEntryDate >= CONVERT(DATE, @startDate))
		AND (@endDate IS NULL OR pore.StockEntryDate <= CONVERT(DATE, @endDate))
		AND (@supplierId IS NULL OR pore.SupplierId = @supplierId)
		AND (@purchaseOrderReferenceNo IS NULL OR pore.ReferenceNo = @purchaseOrderReferenceNo)
	ORDER BY pore.StockEntryDate DESC, pore.Id DESC

	-- (3) Report Details
	--=========================================================================================================
	SELECT
		pore.Id AS PurchaseOrderId
		, COALESCE(p.Code, '') AS ItemCode
		, COALESCE(p.[Name], '') AS ItemName
		, COALESCE(pu.[Name], '') AS UnitName
		, COALESCE(pswa.Quantity, 0) AS Quantity
		, CAST(COALESCE(psw.PricePerUnit, 0) AS DECIMAL(10, 2)) AS PricePerUnit
		, CAST(COALESCE(pswa.Quantity, 0) * COALESCE(psw.PricePerUnit, 0) AS DECIMAL(10, 2)) AS Amount
	FROM
		ProductWarehouseStockReceiptEntries pore
		
		LEFT JOIN ProductStockWarehouseAudit pswa
		ON pore.Id = pswa.ProductWarehouseStockReceiptEntryId
		
		LEFT JOIN ProductStockPerWarehouse psw
		ON pswa.ProductStockPerWarehouseId = psw.Id
		
		LEFT JOIN Products p
		ON psw.ProductId = p.Id
		
		LEFT JOIN ProductUnits pu
		ON p.ProductUnitId = pu.Id
		
	WHERE
		pore.WarehouseId = @warehouseId
		AND pore.IsActive = 1
		AND pore.IsDelete = 0
		AND pswa.IsActive = 1
		AND pswa.IsDelete = 0
		AND (@startDate IS NULL OR pore.StockEntryDate >= CONVERT(DATE, @startDate))
		AND (@endDate IS NULL OR pore.StockEntryDate <= CONVERT(DATE, @endDate))
		AND (@supplierId IS NULL OR pore.SupplierId = @supplierId)
		AND (@purchaseOrderReferenceNo IS NULL OR pore.ReferenceNo = @purchaseOrderReferenceNo)
	ORDER BY pore.StockEntryDate DESC, pore.Id DESC, p.Code

END
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DROP PROCEDURE IF EXISTS [dbo].[Report_Purchase_Orders]");
        }
    }
}
