using Beelina.LIB.BusinessLogic;
using Beelina.LIB.Interfaces;
using OfficeOpenXml;
using ReserbizAPP.LIB.Helpers.Services;
using System.Data;

namespace Beelina.LIB.Models.Reports
{
    public class EndingInventoryPerProductReport<TOutput>
        : BaseReport<TOutput>, IBaseReport<TOutput> where TOutput : BaseReportOutput, new()
    {
        public EndingInventoryPerProductReport(int reportId, int userId, string userFullName, List<ControlValues> controlValues, EmailService emailService, ReportRepository reportRepository)
            : base(reportId, userId, userFullName, controlValues, emailService, reportRepository)
        {

        }

        public EndingInventoryPerProductReport() : base()
        {

        }

        public IBaseReport<TOutput> GenerateAsExcel()
        {
            var reportOutputDataSet = GenerateReportData();

            if (reportOutputDataSet.Tables.Count == 0) return this;

            var reportOutput = new EndingInventoryPerProductReportOutput
            {
                ListOutput = reportOutputDataSet.Tables[0].AsEnumerable().Select(row => new EndingInventoryPerProductReportOutputList
                {
                    Id = row.Field<int>("Id"),
                    Code = row.Field<string>("Code"),
                    Name = row.Field<string>("Name"),
                    BeginningStocks = row.Field<int>("BeginningStocks"),
                    BeginningStocksValue = row.Field<decimal>("BeginningStocksValue"),
                    EndingStocks = row.Field<int>("EndingStocks"),
                    EndingStocksValue = row.Field<decimal>("EndingStocksValue"),
                }).ToList()
            };

            // Add logic here to generate excel file including the excel file saving to the memory stream protected variable.
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using (var package = new ExcelPackage(ReportTemplatePath))
            {
                var worksheet = package.Workbook.Worksheets["Sheet1"];

                var cellNumber = 2;
                foreach (var item in reportOutput.ListOutput)
                {
                    worksheet.Cells[$"A{cellNumber}"].Value = item.Code;
                    worksheet.Cells[$"B{cellNumber}"].Value = item.Name;
                    worksheet.Cells[$"C{cellNumber}"].Value = item.BeginningStocks;
                    worksheet.Cells[$"D{cellNumber}"].Value = item.BeginningStocksValue;
                    worksheet.Cells[$"E{cellNumber}"].Value = item.EndingStocks;
                    worksheet.Cells[$"F{cellNumber}"].Value = item.EndingStocksValue;
                    cellNumber++;
                }

                // Save the Excel file
                ExcelByteArray = package.GetAsByteArray();
            }

            return this;
        }
    }

    public class EndingInventoryPerProductReportOutput : BaseReportOutput
    {
        public List<EndingInventoryPerProductReportOutputList> ListOutput { get; set; }

        public EndingInventoryPerProductReportOutput() : base()
        {
            ListOutput = new List<EndingInventoryPerProductReportOutputList>();
        }
    }

    public class EndingInventoryPerProductReportOutputList
    {
        public int Id { get; internal set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public int BeginningStocks { get; set; }
        public decimal BeginningStocksValue { get; set; }
        public int EndingStocks { get; set; }
        public decimal EndingStocksValue { get; set; }

        public EndingInventoryPerProductReportOutputList()
        {

        }
    }
}