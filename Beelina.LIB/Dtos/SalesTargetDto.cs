using Beelina.LIB.Enums;

namespace Beelina.LIB.Dtos
{
    public class SalesTargetDto
    {
        public int Id { get; set; }
        public int SalesAgentId { get; set; }
        public string SalesAgentName { get; set; } = string.Empty;
        public decimal TargetAmount { get; set; }
        public SalesTargetPeriodTypeEnum PeriodType { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
    }
}