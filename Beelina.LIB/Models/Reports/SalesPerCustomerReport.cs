using Beelina.LIB.BusinessLogic;
using Beelina.LIB.Interfaces;
using OfficeOpenXml;
using ReserbizAPP.LIB.Helpers.Services;
using System.Data;

namespace Beelina.LIB.Models.Reports
{
    public class SalesPerCustomerReport<TOutput>
        : BaseReport<TOutput>, IBaseReport<TOutput> where TOutput : BaseReportOutput, new()
    {
        public SalesPerCustomerReport(int reportId, int userId, string userFullName, List<ControlValues> controlValues, EmailService emailService, ReportRepository reportRepository)
            : base(reportId, userId, userFullName, controlValues, emailService, reportRepository)
        {

        }

        public SalesPerCustomerReport() : base()
        {

        }

        public IBaseReport<TOutput> GenerateAsExcel()
        {
            var reportOutputDataSet = GenerateReportData();

            if (reportOutputDataSet.Tables.Count == 0) return this;

            var reportOutput = new SalesPerCustomerReportOutput
            {
                ListOutput = reportOutputDataSet.Tables[0].AsEnumerable().Select(row => new SalesPerCustomerReportOutputList
                {
                    StoreName = row.Field<string>("StoreName"),
                    InvoiceNo = row.Field<string>("InvoiceNo"),
                    StoreAddress = row.Field<string>("StoreAddress"),
                    GrossAmount = row.Field<decimal>("GrossAmount"),
                    BadOrder = row.Field<decimal>("BadOrder"),
                    NetAmount = row.Field<decimal>("NetAmount"),
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
                    worksheet.Cells[$"A{cellNumber}"].Value = item.StoreName;
                    worksheet.Cells[$"B{cellNumber}"].Value = item.InvoiceNo;
                    worksheet.Cells[$"C{cellNumber}"].Value = item.StoreAddress;
                    worksheet.Cells[$"D{cellNumber}"].Value = item.GrossAmount;
                    worksheet.Cells[$"E{cellNumber}"].Value = item.BadOrder;
                    worksheet.Cells[$"F{cellNumber}"].Value = item.NetAmount;
                    cellNumber++;
                }

                // Save the Excel file
                ExcelByteArray = package.GetAsByteArray();
            }

            return this;
        }
    }

    public class SalesPerCustomerReportOutput : BaseReportOutput
    {
        public List<SalesPerCustomerReportOutputList> ListOutput { get; set; }

        public SalesPerCustomerReportOutput() : base()
        {
            ListOutput = new List<SalesPerCustomerReportOutputList>();
        }
    }

    public class SalesPerCustomerReportOutputList
    {
        public string StoreName { get; internal set; }
        public string InvoiceNo { get; set; }
        public string StoreAddress { get; set; }
        public decimal GrossAmount { get; set; }
        public decimal BadOrder { get; set; }
        public decimal NetAmount { get; set; }

        public SalesPerCustomerReportOutputList()
        {

        }
    }
}