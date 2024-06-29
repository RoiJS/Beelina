using Beelina.LIB.BusinessLogic;
using Beelina.LIB.Enums;
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
                HeaderOutput = reportOutputDataSet.Tables[0].AsEnumerable().Select(row => new SalesPerCustomerReportOutputHeader
                {
                    SalesAgentName = row.Field<string>("SalesAgentName"),
                    FromDate = row.Field<string>("FromDate"),
                    ToDate = row.Field<string>("ToDate"),
                }).FirstOrDefault(),


                ListOutput = reportOutputDataSet.Tables[1].AsEnumerable().Select(row => new SalesPerCustomerReportOutputList
                {
                    StoreName = row.Field<string>("StoreName"),
                    InvoiceNo = row.Field<string>("InvoiceNo"),
                    StoreAddress = row.Field<string>("StoreAddress"),
                    GrossAmount = row.Field<decimal>("GrossAmount"),
                    BadOrder = row.Field<decimal>("BadOrder"),
                    NetAmount = row.Field<decimal>("NetAmount"),
                    Status = (PaymentStatusEnum)row.Field<int>("Status"),
                }).ToList()
            };

            // Add logic here to generate excel file including the excel file saving to the memory stream protected variable.
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using (var package = new ExcelPackage(ReportTemplatePath))
            {
                var worksheet = package.Workbook.Worksheets["Sheet1"];

                worksheet.Cells["B1"].Value = reportOutput.HeaderOutput.SalesAgentName;
                worksheet.Cells["B2"].Value = reportOutput.HeaderOutput.FromDate;
                worksheet.Cells["B3"].Value = reportOutput.HeaderOutput.ToDate;

                var cellNumber = 6;
                foreach (var item in reportOutput.ListOutput)
                {
                    worksheet.Cells[$"A{cellNumber}"].Value = item.StoreName;
                    worksheet.Cells[$"B{cellNumber}"].Value = item.InvoiceNo;
                    worksheet.Cells[$"C{cellNumber}"].Value = item.StoreAddress;
                    worksheet.Cells[$"D{cellNumber}"].Value = item.GrossAmount;
                    worksheet.Cells[$"E{cellNumber}"].Value = item.BadOrder;
                    worksheet.Cells[$"F{cellNumber}"].Value = item.NetAmount;
                    worksheet.Cells[$"G{cellNumber}"].Value = item.Status == PaymentStatusEnum.Unpaid ? "AR" : "";
                    cellNumber++;
                }

                // Lock the worksheet
                LockReport(package, worksheet);

                // Save the Excel file
                ExcelByteArray = package.GetAsByteArray();
            }

            return this;
        }
    }

    public class SalesPerCustomerReportOutput : BaseReportOutput
    {
        public SalesPerCustomerReportOutputHeader HeaderOutput { get; set; }
        public List<SalesPerCustomerReportOutputList> ListOutput { get; set; }

        public SalesPerCustomerReportOutput() : base()
        {
            HeaderOutput = new SalesPerCustomerReportOutputHeader();
            ListOutput = new List<SalesPerCustomerReportOutputList>();
        }
    }

    public class SalesPerCustomerReportOutputHeader
    {
        public string SalesAgentName { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }

        public SalesPerCustomerReportOutputHeader()
        {

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
        public PaymentStatusEnum Status { get; set; }

        public SalesPerCustomerReportOutputList()
        {

        }
    }
}