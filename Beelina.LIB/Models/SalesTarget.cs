using Beelina.LIB.Enums;

namespace Beelina.LIB.Models
{
    public class SalesTarget 
        : Entity
    {
        public int SalesAgentId { get; set; }
        public decimal TargetAmount { get; set; }
        public SalesTargetPeriodTypeEnum PeriodType { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Description { get; set; } = string.Empty;

        // Navigation properties
        public UserAccount SalesAgent { get; set; }
    }
}