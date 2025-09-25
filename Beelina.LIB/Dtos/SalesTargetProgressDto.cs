using Beelina.LIB.Enums;

namespace Beelina.LIB.Dtos
{
    public class SalesTargetProgressDto
    {
        public int Id { get; set; }
        public int SalesAgentId { get; set; }
        public string SalesAgentName { get; set; } = string.Empty;
        public decimal TargetAmount { get; set; }
        public SalesTargetPeriodTypeEnum PeriodType { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Description { get; set; } = string.Empty;
        
        // Progress calculations
        public decimal CurrentSales { get; set; } = 0;
        public decimal RemainingSales { get; set; } = 0;
        public double CompletionPercentage { get; set; } = 0;
        public int DaysRemaining { get; set; } = 0;
        public decimal TargetSalesPerDay { get; set; } = 0;
        public int StoresWithoutOrders { get; set; } = 0;
        public decimal TargetSalesPerStore { get; set; } = 0;
        public int TotalStores { get; set; } = 0;
        
        // Additional metrics
        public bool IsOverdue { get; set; } = false;
        public bool IsTargetMet { get; set; } = false;
        public decimal DailyAverageSales { get; set; } = 0;
        public int DaysElapsed { get; set; } = 0;
        public int TotalDays { get; set; } = 0;
    }
}