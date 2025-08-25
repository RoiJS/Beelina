using Beelina.LIB.BusinessLogic;
using Beelina.LIB.Enums;
using Beelina.LIB.Helpers.Services;
using Beelina.LIB.Interfaces;
using OfficeOpenXml;
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
                InvoiceHeaderOutput = reportOutputDataSet.Tables[0].AsEnumerable().Select(row => new CustomerDetailedTransactionsOutputInvoiceHeader
                {
                    CompanyName = row.Field<string>("CompanyName"),
                    OwnerName = row.Field<string>("OwnerName"),
                    Address = row.Field<string>("Address"),
                    Telephone = row.Field<string>("Telephone"),
                    FaxTelephone = row.Field<string>("FaxTelephone"),
                    Tin = row.Field<string>("Tin"),
                }).FirstOrDefault(),

                HeaderOutput = [.. reportOutputDataSet.Tables[1].AsEnumerable().Select(row => new CustomerDetailedTransactionsReportOutputHeader
                {
                    OrderId = row.Field<int>("OrderId"),
                    InvoiceNo = row.Field<string>("InvoiceNo"),
                    Date = row.Field<string>("Date"),
                    SalesAgentName = row.Field<string>("SalesAgentName"),
                    StoreAddress = row.Field<string>("Address"),
                    StoreName = row.Field<string>("Name"),
                    PaymentMethod = row.Field<string>("PaymentMethod"),
                    Discount = row.Field<double>("Discount")
                })],

                ListOutput = [.. reportOutputDataSet.Tables[2].AsEnumerable().Select(row => new CustomerDetailedTransactionsReportOutputList
                {
                    OrderId = row.Field<int>("OrderId"),
                    ItemCode = row.Field<string>("ItemCode"),
                    ItemName = row.Field<string>("ItemName"),
                    UnitName = row.Field<string>("UnitName"),
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
                    // Sanitize and truncate sheet name using shared base method
                    sheetName = SanitizeWorksheetName(sheetName);
                    
                    var worksheet = worksheetCounter == 1
                        ? package.Workbook.Worksheets[0]
                        : package.Workbook.Worksheets.Add(sheetName);

                    worksheet.Name = sheetName;

                    var currentRow = SetupReportMainHeader(worksheet, reportOutput.InvoiceHeaderOutput);
                    currentRow = SetupReportSubHeader(worksheet, mainLevel, currentRow);
                    currentRow = SetupTableHeader(worksheet, currentRow);
                    currentRow = PopulateTableData(worksheet, reportOutput.ListOutput, mainLevel.OrderId, currentRow);
                    currentRow = AddReportFooter(worksheet, reportOutput.ListOutput, mainLevel, currentRow);
                    AddSignatureSection(worksheet, currentRow);
                    ConfigureWorksheetLayout(worksheet);

                    worksheetCounter++;
                }

                // Save the Excel file
                ExcelByteArray = package.GetAsByteArray();
            }

            return this;
        }

        private int SetupReportMainHeader(ExcelWorksheet worksheet, CustomerDetailedTransactionsOutputInvoiceHeader invoiceHeader)
        {
            // Company Name
            worksheet.Cells["A1"].Value = invoiceHeader.CompanyName;
            worksheet.Cells["A1:F1"].Merge = true;
            worksheet.Cells["A1"].Style.Font.Size = 20;
            worksheet.Cells["A1"].Style.Font.Bold = true;
            worksheet.Cells["A1"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;

            // Owner Name
            worksheet.Cells["A2"].Value = invoiceHeader.OwnerName;
            worksheet.Cells["A2:F2"].Merge = true;
            worksheet.Cells["A2"].Style.Font.Italic = true;
            worksheet.Cells["A2"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;

            // Address
            worksheet.Cells["A3"].Value = invoiceHeader.Address;
            worksheet.Cells["A3:F3"].Merge = true;
            worksheet.Cells["A3"].Style.Font.Italic = true;
            worksheet.Cells["A3"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;

            // Telephone and Fax
            var telephone = String.IsNullOrEmpty(invoiceHeader.Telephone) ? "" : $"Telephone: {invoiceHeader.Telephone};";
            var faxTelephone = String.IsNullOrEmpty(invoiceHeader.FaxTelephone) ? "" : $"Fax Tel: {invoiceHeader.FaxTelephone}";
            worksheet.Cells["A4"].Value = $"{telephone} {faxTelephone}";
            worksheet.Cells["A4:F4"].Merge = true;
            worksheet.Cells["A4"].Style.Font.Italic = true;
            worksheet.Cells["A4"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;

            // TIN
            var tin = String.IsNullOrEmpty(invoiceHeader.Tin) ? "" : $"Tin: {invoiceHeader.Tin}";
            worksheet.Cells["A5"].Value = tin;
            worksheet.Cells["A5:F5"].Merge = true;
            worksheet.Cells["A5"].Style.Font.Italic = true;
            worksheet.Cells["A5"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;

            return 7; // Starting row for next section
        }

        private int SetupReportSubHeader(ExcelWorksheet worksheet, CustomerDetailedTransactionsReportOutputHeader headerData, int startRow)
        {
            var currentRow = startRow;

            // Make labels bold
            worksheet.Cells[$"A{currentRow}:A{currentRow + 4}"].Style.Font.Bold = true;

            // Invoice No
            worksheet.Cells[$"A{currentRow}"].Value = "Invoice No:";
            worksheet.Cells[$"B{currentRow}"].Value = headerData.InvoiceNo;
            worksheet.Cells[$"B{currentRow}:F{currentRow}"].Merge = true;
            currentRow++;

            // Date
            worksheet.Cells[$"A{currentRow}"].Value = "Date:";
            worksheet.Cells[$"B{currentRow}"].Value = headerData.Date;
            worksheet.Cells[$"B{currentRow}:F{currentRow}"].Merge = true;
            currentRow++;

            // Sales Agent
            worksheet.Cells[$"A{currentRow}"].Value = "Sales Agent:";
            worksheet.Cells[$"B{currentRow}"].Value = headerData.SalesAgentName;
            worksheet.Cells[$"B{currentRow}:F{currentRow}"].Merge = true;
            currentRow++;

            // Customer
            worksheet.Cells[$"A{currentRow}"].Value = "Customer:";
            worksheet.Cells[$"B{currentRow}"].Value = $"{headerData.StoreName} - {headerData.StoreAddress}";
            worksheet.Cells[$"B{currentRow}:F{currentRow}"].Merge = true;
            currentRow++;

            // Payment Method
            worksheet.Cells[$"A{currentRow}"].Value = "Payment Method:";
            worksheet.Cells[$"B{currentRow}"].Value = headerData.PaymentMethod;
            worksheet.Cells[$"B{currentRow}:F{currentRow}"].Merge = true;
            currentRow++;

            return currentRow + 1; // Add extra space before table
        }

        private int SetupTableHeader(ExcelWorksheet worksheet, int startRow)
        {
            var headerRow = startRow;

            // Set header values
            worksheet.Cells[$"A{headerRow}"].Value = "Quantity";
            worksheet.Cells[$"B{headerRow}"].Value = "Unit";
            worksheet.Cells[$"C{headerRow}"].Value = "Item Code";
            worksheet.Cells[$"D{headerRow}"].Value = "Product Description";
            worksheet.Cells[$"E{headerRow}"].Value = "Price Per Unit";
            worksheet.Cells[$"F{headerRow}"].Value = "Amount";

            // Style header row
            worksheet.Cells[$"A{headerRow}:F{headerRow}"].Style.Font.Bold = true;

            // Add table borders for header row
            worksheet.Cells[$"A{headerRow}:F{headerRow}"].Style.Border.Top.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            worksheet.Cells[$"A{headerRow}:F{headerRow}"].Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            worksheet.Cells[$"A{headerRow}:F{headerRow}"].Style.Border.Left.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            worksheet.Cells[$"A{headerRow}:F{headerRow}"].Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;

            // Align column headers
            worksheet.Cells[$"A{headerRow}"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right; // Quantity (numeric)
            worksheet.Cells[$"B{headerRow}"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Left;  // Unit (alphanumeric)
            worksheet.Cells[$"C{headerRow}"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Left;  // Item Code (alphanumeric)
            worksheet.Cells[$"D{headerRow}"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Left;  // Product Description (alphanumeric)
            worksheet.Cells[$"E{headerRow}"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right; // Price Per Unit (numeric)
            worksheet.Cells[$"F{headerRow}"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right; // Amount (numeric)

            return headerRow + 1; // Return next row for data
        }

        private int PopulateTableData(ExcelWorksheet worksheet, List<CustomerDetailedTransactionsReportOutputList> listOutput, int orderId, int startRow)
        {
            var rowData = listOutput.Where(l => l.OrderId == orderId).ToList();
            var currentRow = startRow;
            var startDataRow = currentRow;

            foreach (var row in rowData)
            {
                worksheet.Cells[$"A{currentRow}"].Value = row.Quantity;
                worksheet.Cells[$"B{currentRow}"].Value = row.UnitName;
                worksheet.Cells[$"C{currentRow}"].Value = row.ItemCode;
                worksheet.Cells[$"D{currentRow}"].Value = row.ItemName;
                worksheet.Cells[$"E{currentRow}"].Value = row.PricePerUnit;
                worksheet.Cells[$"F{currentRow}"].Value = row.Amount;

                // Format currency columns
                worksheet.Cells[$"E{currentRow}"].Style.Numberformat.Format = "#,##0.00";
                worksheet.Cells[$"F{currentRow}"].Style.Numberformat.Format = "#,##0.00";

                currentRow++;
            }

            // Add table borders for data rows
            if (rowData.Count > 0)
            {
                worksheet.Cells[$"A{startDataRow}:F{currentRow - 1}"].Style.Border.Top.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                worksheet.Cells[$"A{startDataRow}:F{currentRow - 1}"].Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                worksheet.Cells[$"A{startDataRow}:F{currentRow - 1}"].Style.Border.Left.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                worksheet.Cells[$"A{startDataRow}:F{currentRow - 1}"].Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            }

            return currentRow + 1; // Add space before footer
        }

        private int AddReportFooter(ExcelWorksheet worksheet, List<CustomerDetailedTransactionsReportOutputList> listOutput, CustomerDetailedTransactionsReportOutputHeader headerData, int startRow)
        {
            var rowData = listOutput.Where(l => l.OrderId == headerData.OrderId).ToList();
            var currentRow = startRow;

            // Calculate totals
            decimal grossTotal = rowData.Sum(r => r.Amount);
            double discountPercent = headerData.Discount;
            decimal discountAmount = grossTotal * (decimal)(discountPercent / 100.0);
            decimal netTotal = grossTotal - discountAmount;

            // Gross Total
            worksheet.Cells[$"E{currentRow}"].Value = "Gross Total:";
            worksheet.Cells[$"E{currentRow}"].Style.Font.Bold = true;
            worksheet.Cells[$"F{currentRow}"].Value = grossTotal;
            worksheet.Cells[$"F{currentRow}"].Style.Numberformat.Format = "#,##0.00";
            worksheet.Cells[$"F{currentRow}"].Style.Font.Bold = true;
            currentRow++;

            // Discount
            worksheet.Cells[$"E{currentRow}"].Value = $"Discount ({discountPercent}%):";
            worksheet.Cells[$"E{currentRow}"].Style.Font.Bold = true;
            worksheet.Cells[$"F{currentRow}"].Value = discountAmount;
            worksheet.Cells[$"F{currentRow}"].Style.Numberformat.Format = "#,##0.00";
            worksheet.Cells[$"F{currentRow}"].Style.Font.Bold = true;
            currentRow++;

            // Net Total
            worksheet.Cells[$"E{currentRow}"].Value = "Net Total:";
            worksheet.Cells[$"E{currentRow}"].Style.Font.Bold = true;
            worksheet.Cells[$"F{currentRow}"].Value = netTotal;
            worksheet.Cells[$"F{currentRow}"].Style.Numberformat.Format = "#,##0.00";
            worksheet.Cells[$"F{currentRow}"].Style.Font.Bold = true;
            currentRow++;

            return currentRow + 2; // Add extra space before signatures
        }

        private void AddSignatureSection(ExcelWorksheet worksheet, int startRow)
        {
            var currentRow = startRow;

            // Signature labels
            worksheet.Cells[$"A{currentRow}"].Value = "Received By:";
            worksheet.Cells[$"A{currentRow}"].Style.Font.Bold = true;
            worksheet.Cells[$"A{currentRow}:B{currentRow}"].Merge = true;

            worksheet.Cells[$"E{currentRow}"].Value = "Delivered By:";
            worksheet.Cells[$"E{currentRow}"].Style.Font.Bold = true;
            worksheet.Cells[$"E{currentRow}:F{currentRow}"].Merge = true;
            currentRow++;

            // Signature lines
            worksheet.Cells[$"A{currentRow}"].Value = "______________________________";
            worksheet.Cells[$"A{currentRow}:B{currentRow}"].Merge = true;
            worksheet.Cells[$"E{currentRow}"].Value = "______________________________";
            worksheet.Cells[$"E{currentRow}:F{currentRow}"].Merge = true;
            currentRow++;

            // Name & Signature labels
            worksheet.Cells[$"A{currentRow}"].Value = "(Name & Signature)";
            worksheet.Cells[$"A{currentRow}:B{currentRow}"].Merge = true;
            worksheet.Cells[$"A{currentRow}"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet.Cells[$"E{currentRow}"].Value = "(Name & Signature)";
            worksheet.Cells[$"E{currentRow}:F{currentRow}"].Merge = true;
            worksheet.Cells[$"E{currentRow}"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            currentRow++;
            currentRow++;

            // Date fields
            worksheet.Cells[$"A{currentRow}"].Value = "Date:";
            worksheet.Cells[$"A{currentRow}"].Style.Font.Bold = true;
            worksheet.Cells[$"A{currentRow}:B{currentRow}"].Merge = true;
            worksheet.Cells[$"E{currentRow}"].Value = "Date:";
            worksheet.Cells[$"E{currentRow}"].Style.Font.Bold = true;
            worksheet.Cells[$"E{currentRow}:F{currentRow}"].Merge = true;
        }

        private void ConfigureWorksheetLayout(ExcelWorksheet worksheet)
        {
            // Auto-fit columns first
            worksheet.Cells.AutoFitColumns();

            // Set specific column widths
            worksheet.Column(2).Width = 13;
            worksheet.Column(3).Width = 15;
            worksheet.Column(4).Width = 30;
            worksheet.Column(5).Width = 15;
            worksheet.Column(6).Width = 15;

            // Freeze panes to keep headers visible
            worksheet.View.FreezePanes(14, 6);
        }
    }

    public class CustomerDetailedTransactionsReportOutput : BaseReportOutput
    {
        public CustomerDetailedTransactionsOutputInvoiceHeader InvoiceHeaderOutput { get; set; }
        public List<CustomerDetailedTransactionsReportOutputHeader> HeaderOutput { get; set; }
        public List<CustomerDetailedTransactionsReportOutputList> ListOutput { get; set; }

        public CustomerDetailedTransactionsReportOutput() : base()
        {
            HeaderOutput = [];
            ListOutput = [];
        }
    }

    public class CustomerDetailedTransactionsOutputInvoiceHeader
    {
        public string CompanyName { get; set; }
        public string OwnerName { get; set; }
        public string Address { get; set; }
        public string Telephone { get; set; }
        public string FaxTelephone { get; set; }
        public string Tin { get; set; }

        public CustomerDetailedTransactionsOutputInvoiceHeader()
        {

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
        public double Discount { get; set; }

        public CustomerDetailedTransactionsReportOutputHeader()
        {

        }
    }

    public class CustomerDetailedTransactionsReportOutputList
    {
        public int OrderId { get; set; }
        public string ItemCode { get; set; }
        public string ItemName { get; set; }
        public string UnitName { get; set; }
        public int Quantity { get; set; }
        public decimal PricePerUnit { get; set; }
        public decimal Amount { get; set; }

        public CustomerDetailedTransactionsReportOutputList()
        {

        }
    }
}