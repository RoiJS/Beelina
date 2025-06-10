using Beelina.LIB.Enums;

namespace Beelina.LIB.Models
{
    public class ReportControlsRelation
        : Entity
    {
        public int ReportId { get; set; }
        public int ReportControlId { get; set; }
        public int Order { get; set; }
        public string DefaultValue { get; set; }
        public bool AllowAllOption { get; set; } = false;
        public string AgentTypeOptions { get; set; }
        public string OnlyAvailableOnBusinessModel { get; set; }
        public PermissionLevelEnum? OnlyAvailableOnBusinessModelForMinimumPrivilege { get; set; }

        public Report Report { get; set; }
        public ReportControl ReportControl { get; set; }
    }
}