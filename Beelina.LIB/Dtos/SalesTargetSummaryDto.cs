namespace Beelina.LIB.Dtos
{
    public class SalesTargetSummaryDto
    {
        public DateTime DateFrom { get; set; }
        public DateTime DateTo { get; set; }
        public List<SalesTargetProgressDto> SalesTargets { get; set; } = new List<SalesTargetProgressDto>();
        public decimal TotalTargetAmount { get; set; } = 0;
        public decimal TotalCurrentSales { get; set; } = 0;
        public decimal TotalRemainingSales { get; set; } = 0;
        public double OverallCompletionPercentage { get; set; } = 0;
        public int TotalSalesAgents { get; set; } = 0;
        public int SalesAgentsOnTarget { get; set; } = 0;
        public int SalesAgentsBehindTarget { get; set; } = 0;
        public int TotalStoresWithoutOrders { get; set; } = 0;
    }
}