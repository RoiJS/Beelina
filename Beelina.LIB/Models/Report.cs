using Beelina.LIB.Enums;

namespace Beelina.LIB.Models
{
    public class Report
        : Entity
    {
        public string NameTextIdentifier { get; set; }
        public string DescriptionTextIdentifier { get; set; }
        public string ReportClass { get; set; }
        public bool Custom { get; set; }
        public bool Lock { get; set; }
        public string StoredProcedureName { get; set; }
        public ModulesEnum ModuleId { get; set; }
        public PermissionLevelEnum UserMinimumModulePermission { get; set; }
        public PermissionLevelEnum UserMaximumModulePermission { get; set; }
        public BusinessModelEnum? OnlyAvailableOnBusinessModel { get; set; }

        public List<ReportControlsRelation> ReportControlsRelations { get; set; }
    }
}