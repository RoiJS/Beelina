namespace Beelina.LIB.Models
{
    public class ReportParameter
        : Entity
    {
        public string Name { get; set; }
        public int ReportControlId { get; set; }
        public string DataType { get; set; }

        public ReportControl ReportControl { get; set; }
    }
}