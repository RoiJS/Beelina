using Beelina.LIB.BusinessLogic;
using Beelina.LIB.Helpers.Extensions;
using Beelina.LIB.Interfaces;
using OfficeOpenXml;
using ReserbizAPP.LIB.Helpers.Services;
using System.Data;

namespace Beelina.LIB.Models.Reports
{
    public class DailySummarizeTransactionsReport<TOutput>
        : BaseReport<TOutput>, IBaseReport<TOutput> where TOutput : BaseReportOutput, new()
    {
        public DailySummarizeTransactionsReport(int reportId, int userId, string userFullName, List<ControlValues> controlValues, EmailService emailService, ReportRepository reportRepository)
            : base(reportId, userId, userFullName, controlValues, emailService, reportRepository)
        {

        }

        public DailySummarizeTransactionsReport() : base()
        {

        }

        public IBaseReport<TOutput> GenerateAsExcel()
        {
            var reportOutputDataSet = GenerateReportData();

            var reportOutput = new DailySummarizeTransactionsReportOutput
            {
                HeaderOutput = reportOutputDataSet.Tables[0].AsEnumerable().Select(row => new DailySummarizeTransactionsReportOutputHeader
                {
                    InitialStocks = row.Field<decimal>("InitialStocks"),
                    AfterStocks = row.Field<decimal>("AfterStocks"),
                    TotalSales = row.Field<decimal>("TotalSales")
                }).FirstOrDefault(),

                ListOutput = reportOutputDataSet.Tables[1].AsEnumerable().Select(row => new DailySummarizeTransactionsReportOutputList
                {
                    Collectibles = row.Field<decimal>("Collectibles"),
                    // DueCollectibles = row.Field<DateTime>("DueCollectibles"),
                    StoreName = row.Field<string>("StoreName"),
                    StoreAddress = row.Field<string>("StoreAddress"),
                    OrderReceived = row.Field<DateTime>("OrderReceived"),
                    SalesAgentName = row.Field<string>("SalesAgentName"),
                    AreaCovered = row.Field<string>("AreaCovered"),
                    DateCreated = row.Field<DateTime>("DateCreated"),
                }).ToList()
            };

            // Add logic here to generate excel file including the excel file saving to the memory stream protected variable.
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using (var package = new ExcelPackage(ReportTemplatePath))
            {
                var worksheet = package.Workbook.Worksheets["Sheet1"];

                // You can set worksheet properties and add data here
                worksheet.Cells["A2"].Value = reportOutput.HeaderOutput.InitialStocks;
                worksheet.Cells["B2"].Value = reportOutput.HeaderOutput.AfterStocks;
                worksheet.Cells["C2"].Value = reportOutput.HeaderOutput.TotalSales;

                var cellNumber = 5;
                foreach (var item in reportOutput.ListOutput)
                {
                    worksheet.Cells[$"A{cellNumber}"].Value = item.Collectibles;
                    // worksheet.Cells[$"B{cellNumber}"].Value = item.DueCollectibles;
                    worksheet.Cells[$"C{cellNumber}"].Value = item.StoreName;
                    worksheet.Cells[$"D{cellNumber}"].Value = item.StoreAddress;
                    worksheet.Cells[$"E{cellNumber}"].Value = item.OrderReceived;
                    worksheet.Cells[$"E{cellNumber}"].Style.Numberformat.Format = "yyyy-MM-dd";
                    worksheet.Cells[$"F{cellNumber}"].Value = item.SalesAgentName;
                    worksheet.Cells[$"G{cellNumber}"].Value = item.AreaCovered;
                    // worksheet.Cells[$"I{cellNumber}"].Value = item.DateCreated;
                    // worksheet.Cells[$"I{cellNumber}"].Style.Numberformat.Format = "yyyy-MM-dd";
                    cellNumber++;
                }

                // Save the Excel file
                ExcelByteArray = package.GetAsByteArray();
            }

            return this;
        }

        protected override string GenerateReportEmailContent()
        {
            var template = "";
            var reportName = Report.ReportClass.AddSpacesToPascal();

            using (var rdFile = new StreamReader(String.Format("{0}/{1}/EmailNotificationReportGeneration.html", AppDomain.CurrentDomain.BaseDirectory, BaseEmailTemplatePath)))
            {
                template = rdFile.ReadToEnd();
            }

            template = template.Replace("#customername", UserFullName);
            template = template.Replace("#reportname", reportName);

            return template;
        }
    }

    public class BaseReportOutput
    {
        public BaseReportOutput()
        {

        }
    }

    public class DailySummarizeTransactionsReportOutput : BaseReportOutput
    {
        public DailySummarizeTransactionsReportOutputHeader HeaderOutput { get; set; }
        public List<DailySummarizeTransactionsReportOutputList> ListOutput { get; set; }

        public DailySummarizeTransactionsReportOutput() : base()
        {
            HeaderOutput = new DailySummarizeTransactionsReportOutputHeader();
            ListOutput = new List<DailySummarizeTransactionsReportOutputList>();
        }
    }

    public class DailySummarizeTransactionsReportOutputList
    {
        public decimal Collectibles { get; set; }
        public DateTime DueCollectibles { get; set; }
        public string StoreName { get; set; }
        public string StoreAddress { get; set; }
        public DateTime OrderReceived { get; set; }
        public string SalesAgentName { get; set; }
        public string AreaCovered { get; set; }
        public DateTime DateCreated { get; set; }

        public DailySummarizeTransactionsReportOutputList()
        {

        }
    }

    public class DailySummarizeTransactionsReportOutputHeader
    {
        public decimal InitialStocks { get; set; }
        public decimal AfterStocks { get; set; }
        public decimal TotalSales { get; set; }
    }
}