namespace Beelina.LIB.Models
{
    public class ProfitBreakdown
    {
        /// <summary>
        /// Profit from purchase order discounts obtained from suppliers
        /// </summary>
        public double PurchaseOrderDiscountProfit { get; set; }

        /// <summary>
        /// Profit from sales price differences (sales price - cost price)
        /// </summary>
        public double SalesPriceProfit { get; set; }

        /// <summary>
        /// Total profit calculated as the sum of all profit sources
        /// </summary>
        public double TotalProfit => PurchaseOrderDiscountProfit + SalesPriceProfit;

        /// <summary>
        /// Percentage breakdown of purchase order discount profit
        /// </summary>
        public double PurchaseOrderDiscountProfitPercentage => 
            TotalProfit > 0 ? Math.Round((PurchaseOrderDiscountProfit / TotalProfit) * 100, 2) : 0;

        /// <summary>
        /// Percentage breakdown of sales price profit
        /// </summary>
        public double SalesPriceProfitPercentage => 
            TotalProfit > 0 ? Math.Round((SalesPriceProfit / TotalProfit) * 100, 2) : 0;
    }
}