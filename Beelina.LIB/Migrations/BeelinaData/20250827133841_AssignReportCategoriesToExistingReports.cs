using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations.BeelinaData
{
    /// <inheritdoc />
    public partial class AssignReportCategoriesToExistingReports : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Order Transactions Category (ReportCategoryEnum.OrderTransactions = 1)
            migrationBuilder.Sql(@"
                UPDATE Reports 
                SET Category = 1 
                WHERE ReportClass IN (
                    'CustomerDetailedTransactionsReport',
                    'DailyDetailedTransactionsReport',
                    'DailySummarizeTransactionsReport',
                    'SupplierProductTransactionsReport'
                )");

            // Products Category (ReportCategoryEnum.Products = 2)
            migrationBuilder.Sql(@"
                UPDATE Reports 
                SET Category = 2 
                WHERE ReportClass IN (
                    'EndingInventoryPerProductReportAdmin',
                    'EndingInventoryPerProductReportAgent',
                    'ProductWithdrawalReport',
                    'ProductWithdrawalReport2',
                    'PurchaseOrderReport'
                )");

            // Sales Category (ReportCategoryEnum.Sales = 3)
            migrationBuilder.Sql(@"
                UPDATE Reports 
                SET Category = 3 
                WHERE ReportClass IN (
                    'CustomerCollectionSummaryReport',
                    'SalesAgentCollectionSummaryReport',
                    'SalesPerCustomerReport'
                )");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Reset all categories to default value (0)
            migrationBuilder.Sql("UPDATE Reports SET Category = 0");
        }
    }
}
