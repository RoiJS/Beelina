namespace Beelina.LIB.Models
{
    public class ReportControl
        : Entity
    {
        public string Name { get; set; }
        public string ParentContainerName { get; set; }
        public string CustomCSSClasses { get; set; }
        public ReportParameter ReportParameter { get; set; }
    }
}