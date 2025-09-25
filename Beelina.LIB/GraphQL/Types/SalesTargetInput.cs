using Beelina.LIB.Enums;

namespace Beelina.LIB.GraphQL.Types
{
    public class SalesTargetInput
    {
        public int Id { get; set; } = 0;
        public int SalesAgentId { get; set; }
        public decimal TargetAmount { get; set; }
        public SalesTargetPeriodTypeEnum PeriodType { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public string Description { get; set; } = string.Empty;
    }
}