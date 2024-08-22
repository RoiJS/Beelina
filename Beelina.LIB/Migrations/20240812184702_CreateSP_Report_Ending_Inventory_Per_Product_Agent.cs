﻿using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations
{
    /// <inheritdoc />
    public partial class CreateSP_Report_Ending_Inventory_Per_Product_Agent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
migrationBuilder.Sql(@"
-- =============================================
-- Author:		Roi Larrence Amatong
-- Create date: 2023-11-15
-- Description:	Create Ending Inventory Per Product Report

-- Author:		Roi Larrence Amatong
-- Create date: 2024-01-01
-- Description:	Fix inconsistency values. Introduced product unit name.

-- Modified By: Roi Larrence Amatong
-- Modified Date: 2024-02-01
-- Description: Introduce returning of dates and sales agent name

-- Modified By: Roi Larrence Amatong
-- Modified Date: 2024-02-01
-- Description: Make sure to only return items with Beginning and Ending Stocks

-- Modified By: Roi Larrence Amatong
-- Modified Date: 2024-02-01
-- Description: Introduce Sold Stocks and Sold Stocks Value

-- Modified By: Roi Larrence Amatong
-- Modified Date: 2024-04-11
-- Description: Introduce ending inventory data from Warehouse
-- =============================================
-- EXEC Report_Ending_Inventory_Per_Product_Agent @startDate = '2024-01-01', @endDate = '2024-08-30', @salesAgentId = 3, @userId = 1, @warehouseId = 1

CREATE OR ALTER PROCEDURE [dbo].[Report_Ending_Inventory_Per_Product_Agent]
	@startDate VARCHAR(10) = NULL
	, @endDate VARCHAR(10) = NULL
	, @salesAgentId INT = 0
	, @warehouseId INT = 1
	, @userId INT = 0
AS
BEGIN

	DECLARE @salesAgentName AS NVARCHAR(MAX)
	DECLARE @businessModel AS INT

	SET @businessModel = COALESCE((SELECT BusinessModel FROM GeneralSettings), 1)
	SET @salesAgentName = COALESCE((SELECT CONCAT(u.FirstName, ' ', u.LastName) FROM UserAccounts u WHERE Id = @salesAgentId), '')

    -- (1) Report Header
	SELECT
		@salesAgentName AS SalesAgentName
		, @startDate AS FromDate
		, @endDate AS ToDate
	
	-- (2) Report Data
	IF @businessModel = 1 
		EXEC Report_Ending_Inventory_Per_Product_Panel_Model_1 @startDate, @endDate, @salesAgentId, @warehouseId, @businessModel
	ELSE
		EXEC Report_Ending_Inventory_Per_Product_Panel_Model_2 @startDate, @endDate, @salesAgentId, @warehouseId, @businessModel
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
