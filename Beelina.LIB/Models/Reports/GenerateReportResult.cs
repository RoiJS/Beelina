using Beelina.LIB.Enums;

namespace Beelina.LIB.Models.Reports
{
    public class GenerateReportResult
    {
        public GenerateReportOptionEnum GenerateReportOption { get; set; }
        public ReportDataResult ReportData { get; set; }
    }

    public class ReportDataResult
    {
        public string FileName { get; set; }
        public string Base64String { get; set; }
        public string ContentType { get; set; }
    }
}