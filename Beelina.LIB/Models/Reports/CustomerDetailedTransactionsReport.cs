using Beelina.LIB.BusinessLogic;
using Beelina.LIB.Enums;
using Beelina.LIB.Interfaces;
using OfficeOpenXml;
using ReserbizAPP.LIB.Helpers.Services;
using System.Data;

namespace Beelina.LIB.Models.Reports
{
    public class CustomerDetailedTransactionsReport<TOutput>
        : BaseReport<TOutput>, IBaseReport<TOutput> where TOutput : BaseReportOutput, new()
    {
        public CustomerDetailedTransactionsReport(int reportId, int userId, string userFullName, List<ControlValues> controlValues, EmailService emailService, ReportRepository reportRepository)
            : base(reportId, userId, userFullName, controlValues, emailService, reportRepository)
        {

        }

        public CustomerDetailedTransactionsReport() : base()
        {

        }

        public IBaseReport<TOutput> GenerateAsExcel()
        {
            var reportOutputDataSet = GenerateReportData();

            var reportOutput = new CustomerDetailedTransactionsReportOutput
            {
                HeaderOutput = [.. reportOutputDataSet.Tables[0].AsEnumerable().Select(row => new CustomerDetailedTransactionsReportOutputHeader
                {
                    OrderId = row.Field<int>("OrderId"),
                    InvoiceNo = row.Field<string>("InvoiceNo"),
                    Date = row.Field<string>("Date"),
                    SalesAgentName = row.Field<string>("SalesAgentName"),
                    StoreAddress = row.Field<string>("Address"),
                    StoreName = row.Field<string>("Name"),
                    PaymentMethod = row.Field<string>("PaymentMethod"),
                })],

                ListOutput = [.. reportOutputDataSet.Tables[1].AsEnumerable().Select(row => new CustomerDetailedTransactionsReportOutputList
                {
                    OrderId = row.Field<int>("OrderId"),
                    ItemCode = row.Field<string>("ItemCode"),
                    ItemName = row.Field<string>("ItemName"),
                    PricePerUnit = row.Field<decimal>("PricePerUnit"),
                    Quantity = row.Field<int>("Quantity"),
                    Amount = row.Field<decimal>("Amount"),

                })]
            };

            // Add logic here to generate excel file including the excel file saving to the memory stream protected variable.
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using (var package = new ExcelPackage())
            {
                package.Workbook.Worksheets.Add("Sheet1"); // Default sheet

                var worksheetCounter = 1;
                foreach (var mainLevel in reportOutput.HeaderOutput)
                {
                    var sheetName = $"{mainLevel.InvoiceNo} - {mainLevel.StoreName}";
                    var worksheet = worksheetCounter == 1
                        ? package.Workbook.Worksheets[0]
                        : package.Workbook.Worksheets.Add(sheetName);

                    worksheet.Name = sheetName;

                    // (1) Setup Header Fields
                    worksheet.Cells["A1"].Value = "Invoice No:";
                    worksheet.Cells["A2"].Value = "Date:";
                    worksheet.Cells["A3"].Value = "Sales Agent:";
                    worksheet.Cells["A4"].Value = "Customer:";
                    worksheet.Cells["A5"].Value = "Payment Method:";

                    worksheet.Cells["A7"].Value = "Item Code";
                    worksheet.Cells["B7"].Value = "Product Description";
                    worksheet.Cells["C7"].Value = "Price Per Unit";
                    worksheet.Cells["D7"].Value = "Quantity";
                    worksheet.Cells["E7"].Value = "Amount";

                    // (2) Setup Header Styles
                    worksheet.Cells["A1"].Style.Font.Bold = true;
                    worksheet.Cells["A2"].Style.Font.Bold = true;
                    worksheet.Cells["A3"].Style.Font.Bold = true;
                    worksheet.Cells["A4"].Style.Font.Bold = true;
                    worksheet.Cells["A5"].Style.Font.Bold = true;

                    worksheet.Cells["A7"].Style.Font.Bold = true;
                    worksheet.Cells["B7"].Style.Font.Bold = true;
                    worksheet.Cells["C7"].Style.Font.Bold = true;
                    worksheet.Cells["D7"].Style.Font.Bold = true;
                    worksheet.Cells["E7"].Style.Font.Bold = true;

                    // (3) Setup Header Values
                    worksheet.Cells["B1"].Value = mainLevel.InvoiceNo;
                    worksheet.Cells["B2"].Value = mainLevel.Date;
                    worksheet.Cells["B3"].Value = mainLevel.SalesAgentName;
                    worksheet.Cells["B4"].Value = $"{mainLevel.StoreName} - {mainLevel.StoreAddress}";
                    worksheet.Cells["B4"].Value = mainLevel.PaymentMethod;

                    var rowData = reportOutput.ListOutput.Where(l => l.OrderId == mainLevel.OrderId).ToList();

                    // (4) Setup Row Data
                    var cellNumber = 8;
                    foreach (var row in rowData)
                    {
                        worksheet.Cells[$"A{cellNumber}"].Value = row.ItemCode;
                        worksheet.Cells[$"B{cellNumber}"].Value = row.ItemName;
                        worksheet.Cells[$"C{cellNumber}"].Value = row.PricePerUnit;
                        worksheet.Cells[$"D{cellNumber}"].Value = row.Quantity;
                        worksheet.Cells[$"E{cellNumber}"].Value = row.Amount;

                        worksheet.Cells[$"C{cellNumber}"].Style.Numberformat.Format = "#,##0.00";
                        worksheet.Cells[$"E{cellNumber}"].Style.Numberformat.Format = "#,##0.00";

                        cellNumber++;
                    }

                    // Lock the worksheet
                    LockReport(package, worksheet);

                    worksheetCounter++;
                }
                // Save the Excel file
                ExcelByteArray = package.GetAsByteArray();
            }

            return this;
        }
    }

    public class CustomerDetailedTransactionsReportOutput : BaseReportOutput
    {
        public List<CustomerDetailedTransactionsReportOutputHeader> HeaderOutput { get; set; }
        public List<CustomerDetailedTransactionsReportOutputList> ListOutput { get; set; }

        public CustomerDetailedTransactionsReportOutput() : base()
        {
            HeaderOutput = [];
            ListOutput = [];
        }
    }

    public class CustomerDetailedTransactionsReportOutputHeader
    {
        public string SalesAgentName { get; set; }
        public string Date { get; set; }
        public string PaymentMethod { get; set; }
        public string StoreName { get; set; }
        public string StoreAddress { get; set; }
        public string InvoiceNo { get; set; }
        public int OrderId { get; set; }

        public CustomerDetailedTransactionsReportOutputHeader()
        {

        }
    }

    public class CustomerDetailedTransactionsReportOutputList
    {
        public int OrderId { get; set; }
        public string ItemCode { get; set; }
        public string ItemName { get; set; }
        public int Quantity { get; set; }
        public decimal PricePerUnit { get; set; }
        public decimal Amount { get; set; }

        public CustomerDetailedTransactionsReportOutputList()
        {

        }
    }
}