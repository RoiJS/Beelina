using Beelina.LIB.BusinessLogic;
using Beelina.LIB.Interfaces;
using OfficeOpenXml;
using ReserbizAPP.LIB.Helpers.Services;
using System.Data;

namespace Beelina.LIB.Models.Reports
{
    public class ProductWithdrawalReport2<TOutput>
        : BaseReport<TOutput>, IBaseReport<TOutput> where TOutput : BaseReportOutput, new()
    {
        public ProductWithdrawalReport2(
            int reportId,
            int userId,
            string userFullName,
            List<ControlValues> controlValues,
            EmailService emailService,
            ReportRepository reportRepository)
            : base(reportId, userId, userFullName, controlValues, emailService, reportRepository)
        {

        }

        public ProductWithdrawalReport2() : base()
        {

        }

        public IBaseReport<TOutput> GenerateAsExcel()
        {
            var reportOutputDataSet = GenerateReportData();

            if (reportOutputDataSet.Tables.Count == 0) return this;

            var reportOutput = new ProductWithdrawalReport2Output
            {
                HeaderOutput = reportOutputDataSet.Tables[0].AsEnumerable().Select(row => new ProductWithdrawalReportOutputHeader
                {
                    SalesAgentName = row.Field<string>("SalesAgentName"),
                    FromDate = row.Field<string>("FromDate"),
                    ToDate = row.Field<string>("ToDate"),
                }).FirstOrDefault(),

                ListOutput = reportOutputDataSet.Tables[1].AsEnumerable().Select(row => new ProductWithdrawalReport2OutputList
                {
                    InvoiceNo = row.Field<string>("InvoiceNo"),
                    ProductCode = row.Field<string>("ProductCode"),
                    ProductName = row.Field<string>("ProductName"),
                    ProductUnit = row.Field<string>("ProductUnit"),
                    Quantity = row.Field<int>("Quantity"),
                }).ToList()
            };

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
                    worksheet.Cells[$"A{cellNumber}"].Value = item.InvoiceNo;
                    worksheet.Cells[$"B{cellNumber}"].Value = item.ProductCode;
                    worksheet.Cells[$"C{cellNumber}"].Value = item.ProductName;
                    worksheet.Cells[$"D{cellNumber}"].Value = item.ProductUnit;
                    worksheet.Cells[$"E{cellNumber}"].Value = item.Quantity;
                    cellNumber++;
                }

                // Lock the worksheet
                LockReport(package, worksheet);

                // Save the Excel file
                ExcelByteArray = package.GetAsByteArray();
            }

            return this;
        }

        protected override string ReportRequestedDate()
        {
            var fromDateControl = ControlValues.Where(c => c.ControlId == 3).FirstOrDefault();
            var toDateControl = ControlValues.Where(c => c.ControlId == 4).FirstOrDefault();
            if (fromDateControl is null || toDateControl is null) return String.Empty;
            return String.Format("{0} - {1}", fromDateControl.CurrentValue, toDateControl.CurrentValue);
        }
    }

    public class ProductWithdrawalReport2Output : BaseReportOutput
    {
        public ProductWithdrawalReportOutputHeader HeaderOutput { get; set; }
        public List<ProductWithdrawalReport2OutputList> ListOutput { get; set; }

        public ProductWithdrawalReport2Output() : base()
        {
            HeaderOutput = new ProductWithdrawalReportOutputHeader();
            ListOutput = new List<ProductWithdrawalReport2OutputList>();
        }
    }

    public class ProductWithdrawalReport2OutputList
    {
        public string InvoiceNo { get; internal set; }
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public string ProductUnit { get; set; }
        public int Quantity { get; set; }

        public ProductWithdrawalReport2OutputList()
        {

        }
    }
}