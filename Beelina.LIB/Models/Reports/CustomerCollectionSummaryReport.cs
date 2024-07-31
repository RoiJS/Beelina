using Beelina.LIB.BusinessLogic;
using Beelina.LIB.Enums;
using Beelina.LIB.Interfaces;
using OfficeOpenXml;
using ReserbizAPP.LIB.Helpers.Services;
using System.Data;

namespace Beelina.LIB.Models.Reports
{
    public class CustomerCollectionSummaryReport<TOutput>
        : BaseReport<TOutput>, IBaseReport<TOutput> where TOutput : BaseReportOutput, new()
    {
        public CustomerCollectionSummaryReport(int reportId, int userId, string userFullName, List<ControlValues> controlValues, EmailService emailService, ReportRepository reportRepository)
            : base(reportId, userId, userFullName, controlValues, emailService, reportRepository)
        {

        }

        public CustomerCollectionSummaryReport() : base()
        {

        }

        public IBaseReport<TOutput> GenerateAsExcel()
        {
            var reportOutputDataSet = GenerateReportData();

            var reportOutput = new CustomerCollectionSummaryReportOutput
            {
                HeaderOutput = [.. reportOutputDataSet.Tables[0].AsEnumerable().Select(row => new CustomerCollectionSummaryReportOutputHeader
                {
                    Id = row.Field<int>("Id"),
                    Name = row.Field<string>("Name"),
                })],

                ListOutput = [.. reportOutputDataSet.Tables[1].AsEnumerable().Select(row => new CustomerCollectionSummaryReportOutputList
                {
                    Id = row.Field<int>("Id"),
                    InvoiceNo = row.Field<string>("InvoiceNo"),
                    TransactionDate = row.Field<DateTime>("TransactionDate"),
                    GrossAmount = row.Field<decimal>("GrossAmount"),
                    BadOrder = row.Field<decimal>("BadOrder"),
                    NetAmount = row.Field<decimal>("NetAmount"),
                    Status = row.Field<int>("Status"),
                    StoreId = row.Field<int>("StoreId"),
                    CreatedById = row.Field<int>("CreatedById"),
                    Payments = row.Field<decimal>("Payments"),
                    Balance = row.Field<decimal>("Balance"),
                })]
            };

            // Add logic here to generate excel file including the excel file saving to the memory stream protected variable.
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using (var package = new ExcelPackage(ReportTemplatePath))
            {
                var worksheet = package.Workbook.Worksheets["Sheet1"];

                var mainRowLevel = 2;
                foreach (var mainLevel in reportOutput.HeaderOutput)
                {
                    var rowData = reportOutput.ListOutput.Where(l => l.StoreId == mainLevel.Id).ToList();

                    // (4) Setup Row Data
                    var cellNumber = mainRowLevel;
                    worksheet.Cells[$"A{mainRowLevel}"].Value = mainLevel.Name;

                    foreach (var row in rowData)
                    {
                        worksheet.Cells[$"B{cellNumber}"].Value = row.TransactionDate;
                        worksheet.Cells[$"C{cellNumber}"].Value = row.InvoiceNo;
                        worksheet.Cells[$"D{cellNumber}"].Value = row.NetAmount;
                        worksheet.Cells[$"E{cellNumber}"].Value = row.Payments == 0 ? string.Empty : row.Payments;
                        worksheet.Cells[$"F{cellNumber}"].Value = row.Balance == 0 ? string.Empty : row.Balance;
                        worksheet.Cells[$"G{cellNumber}"].Value = row.BadOrder == 0 ? string.Empty : row.BadOrder;

                        worksheet.Cells[$"D{cellNumber}"].Style.Numberformat.Format = "#,##0.00";
                        worksheet.Cells[$"E{cellNumber}"].Style.Numberformat.Format = "#,##0.00";
                        worksheet.Cells[$"F{cellNumber}"].Style.Numberformat.Format = "#,##0.00";
                        worksheet.Cells[$"G{cellNumber}"].Style.Numberformat.Format = "#,##0.00";

                        cellNumber++;
                        mainRowLevel++;
                    }

                    worksheet.Cells[$"C{cellNumber}"].Value = rowData.Count;
                    worksheet.Cells[$"F{cellNumber}"].Value = rowData.Sum(l => l.Balance);
                    worksheet.Cells[$"F{cellNumber}"].Style.Numberformat.Format = "#,##0.00";

                    worksheet.Cells[$"C{cellNumber}"].Style.Font.Bold = true;
                    worksheet.Cells[$"F{cellNumber}"].Style.Font.Bold = true;

                    cellNumber += 2;
                    mainRowLevel += 2;

                    var startMerge = mainRowLevel - rowData.Count - 2;
                    var endMerge = mainRowLevel - 1;
                    worksheet.Cells[$"A{startMerge}:A{endMerge}"].Merge = true;
                    worksheet.Cells[$"A{startMerge}:A{endMerge}"].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Top;

                    worksheet.Column(2).Width = 13;
                    worksheet.Column(4).Width = 15;
                    worksheet.Column(5).Width = 15;
                    worksheet.Column(6).Width = 15;
                }

                // Lock the worksheet
                LockReport(package, worksheet);

                // Save the Excel file
                ExcelByteArray = package.GetAsByteArray();
            }

            return this;
        }
    }

    public class CustomerCollectionSummaryReportOutput : BaseReportOutput
    {
        public List<CustomerCollectionSummaryReportOutputHeader> HeaderOutput { get; set; }
        public List<CustomerCollectionSummaryReportOutputList> ListOutput { get; set; }

        public CustomerCollectionSummaryReportOutput() : base()
        {
            HeaderOutput = [];
            ListOutput = [];
        }
    }

    public class CustomerCollectionSummaryReportOutputHeader
    {
        public int Id { get; set; }
        public string Name { get; set; }

        public CustomerCollectionSummaryReportOutputHeader()
        {

        }
    }

    public class CustomerCollectionSummaryReportOutputList
    {
        public int Id { get; set; }
        public string InvoiceNo { get; set; }
        public DateTime TransactionDate { get; set; }
        public decimal GrossAmount { get; set; }
        public decimal BadOrder { get; set; }
        public decimal NetAmount { get; set; }
        public int Status { get; set; }
        public int StoreId { get; set; }
        public int CreatedById { get; set; }
        public decimal Payments { get; set; }
        public decimal Balance { get; set; }

        public CustomerCollectionSummaryReportOutputList()
        {

        }
    }
}