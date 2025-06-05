using Beelina.LIB.BusinessLogic;
using Beelina.LIB.Enums;
using Beelina.LIB.Helpers.Services;
using Beelina.LIB.Interfaces;
using OfficeOpenXml;
using System.Data;
using System.Linq.Expressions;

namespace Beelina.LIB.Models.Reports
{
    public class EndingInventoryPerProductReportAdmin<TOutput>
        : BaseReport<TOutput>, IBaseReport<TOutput> where TOutput : BaseReportOutput, new()
    {
        public EndingInventoryPerProductReportAdmin(int reportId, int userId, string userFullName, List<ControlValues> controlValues, EmailService emailService, ReportRepository reportRepository)
            : base(reportId, userId, userFullName, controlValues, emailService, reportRepository)
        {

        }

        public EndingInventoryPerProductReportAdmin() : base()
        {

        }

        public IBaseReport<TOutput> GenerateAsExcel()
        {
            var reportOutputDataSet = GenerateReportData();

            if (reportOutputDataSet.Tables.Count == 0) return this;

            var reportOutput = new EndingInventoryPerProductReportAdminOutput
            {
                HeaderOutput = reportOutputDataSet.Tables[0].AsEnumerable().Select(row => new EndingInventoryPerProductReportAdminOutputHeader
                {
                    WarehouseName = row.Field<string>("WarehouseName"),
                    FromDate = row.Field<string>("FromDate"),
                    ToDate = row.Field<string>("ToDate"),
                    BusinessModel = row.Field<BusinessModelEnum>("BusinessModel"),
                }).FirstOrDefault(),
            };

            reportOutput.ListOutput = [.. reportOutputDataSet.Tables[1].AsEnumerable().Select(row => new EndingInventoryPerProductReportAdminOutputList
            {
                Code = row.Field<string>("Code"),
                Name = row.Field<string>("Name"),
                BeginningStocks = row.Field<int>("BeginningStocks"),
                BeginningStocksValue = row.Field<decimal>("BeginningStocksValue"),
                EndingStocks = row.Field<int>("EndingStocks"),
                EndingStocksValue = row.Field<decimal>("EndingStocksValue"),
                WithdrawnStocks = row.Field<int>("WithdrawnStocks"),
                WithdrawnStocksValue = row.Field<decimal>("WithdrawnStocksValue"),
                SoldStocks = reportOutput.HeaderOutput.BusinessModel != BusinessModelEnum.WarehousePanelHybridMonitoring ? null : row.Field<int>("SoldStocks"),
                SoldStocksValue = reportOutput.HeaderOutput.BusinessModel != BusinessModelEnum.WarehousePanelHybridMonitoring ? null : row.Field<decimal>("SoldStocksValue"),
            })];

            // Add logic here to generate excel file including the excel file saving to the memory stream protected variable.
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using (var package = new ExcelPackage(ReportTemplatePath))
            {
                var worksheet = package.Workbook.Worksheets["Sheet1"];

                worksheet.Cells["B1"].Value = reportOutput.HeaderOutput.WarehouseName;
                worksheet.Cells["B2"].Value = reportOutput.HeaderOutput.FromDate;
                worksheet.Cells["B3"].Value = reportOutput.HeaderOutput.ToDate;

                var cellNumber = 6;
                foreach (var item in reportOutput.ListOutput)
                {
                    worksheet.Cells[$"A{cellNumber}"].Value = item.Code;
                    worksheet.Cells[$"B{cellNumber}"].Value = item.Name;
                    worksheet.Cells[$"C{cellNumber}"].Value = item.BeginningStocks;
                    worksheet.Cells[$"D{cellNumber}"].Value = item.BeginningStocksValue;
                    worksheet.Cells[$"E{cellNumber}"].Value = item.EndingStocks;
                    worksheet.Cells[$"F{cellNumber}"].Value = item.EndingStocksValue;
                    worksheet.Cells[$"G{cellNumber}"].Value = item.WithdrawnStocks;
                    worksheet.Cells[$"H{cellNumber}"].Value = item.WithdrawnStocksValue;

                    if (reportOutput.HeaderOutput.BusinessModel == BusinessModelEnum.WarehousePanelHybridMonitoring)
                    {
                        worksheet.Cells[$"I{cellNumber}"].Value = item.SoldStocks;
                        worksheet.Cells[$"J{cellNumber}"].Value = item.SoldStocksValue;
                    }
                    else
                    {
                        worksheet.Cells[$"I5"].Value = String.Empty;
                        worksheet.Cells[$"J5"].Value = String.Empty;
                    }

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

    public class EndingInventoryPerProductReportAdminOutput : BaseReportOutput
    {
        public EndingInventoryPerProductReportAdminOutputHeader HeaderOutput { get; set; }
        public List<EndingInventoryPerProductReportAdminOutputList> ListOutput { get; set; }

        public EndingInventoryPerProductReportAdminOutput() : base()
        {
            HeaderOutput = new EndingInventoryPerProductReportAdminOutputHeader();
            ListOutput = new List<EndingInventoryPerProductReportAdminOutputList>();
        }
    }

    public class EndingInventoryPerProductReportAdminOutputHeader
    {
        public string WarehouseName { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }
        public BusinessModelEnum BusinessModel { get; set; }

        public EndingInventoryPerProductReportAdminOutputHeader()
        {

        }
    }

    public class EndingInventoryPerProductReportAdminOutputList
    {
        public int Id { get; internal set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public int BeginningStocks { get; set; }
        public decimal BeginningStocksValue { get; set; }
        public int EndingStocks { get; set; }
        public decimal EndingStocksValue { get; set; }
        public int WithdrawnStocks { get; set; }
        public decimal WithdrawnStocksValue { get; set; }
        public int? SoldStocks { get; set; }
        public decimal? SoldStocksValue { get; set; }

        public EndingInventoryPerProductReportAdminOutputList()
        {

        }
    }
}