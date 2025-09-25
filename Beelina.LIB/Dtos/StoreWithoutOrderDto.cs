namespace Beelina.LIB.Dtos
{
    public class StoreWithoutOrderDto
    {
        public int StoreId { get; set; }
        public string StoreName { get; set; } = string.Empty;
        public string StoreCode { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public int SalesAgentId { get; set; }
        public string SalesAgentName { get; set; } = string.Empty;
        public DateTime LastOrderDate { get; set; }
        public int DaysSinceLastOrder { get; set; } = 0;
        public decimal SuggestedTargetSales { get; set; } = 0;
        public decimal HistoricalAverageSales { get; set; } = 0;
    }
}