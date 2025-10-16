using Beelina.LIB.BusinessLogic;
using Beelina.LIB.Enums;
using Beelina.LIB.Helpers.Services;
using Beelina.LIB.Interfaces;
using OfficeOpenXml;
using System.Data;

namespace Beelina.LIB.Models.Reports
{
    public class PurchaseOrderReport<TOutput>
        : BaseReport<TOutput>, IBaseReport<TOutput> where TOutput : BaseReportOutput, new()
    {
        public PurchaseOrderReport(int reportId, int userId, string userFullName, List<ControlValues> controlValues, EmailService emailService, ReportRepository reportRepository)
            : base(reportId, userId, userFullName, controlValues, emailService, reportRepository)
        {

        }

        public PurchaseOrderReport() : base()
        {

        }

        public IBaseReport<TOutput> GenerateAsExcel()
        {
            var reportOutputDataSet = GenerateReportData();

            var reportOutput = new PurchaseOrderReportOutput
            {
                InvoiceHeaderOutput = reportOutputDataSet.Tables[0].AsEnumerable().Select(row => new PurchaseOrderOutputInvoiceHeader
                {
                    CompanyName = row.Field<string>("CompanyName"),
                    OwnerName = row.Field<string>("OwnerName"),
                    Address = row.Field<string>("Address"),
                    Telephone = row.Field<string>("Telephone"),
                    FaxTelephone = row.Field<string>("FaxTelephone"),
                    Tin = row.Field<string>("Tin"),
                    UserFullName = row.Field<string>("UserFullName"),
                }).FirstOrDefault(),

                HeaderOutput = [.. reportOutputDataSet.Tables[1].AsEnumerable().Select(row => new PurchaseOrderReportOutputHeader
                {
                    PurchaseOrderId = row.Field<int>("PurchaseOrderId"),
                    ReferenceNo = row.Field<string>("ReferenceNo"),
                    StockEntryDate = row.Field<string>("StockEntryDate"),
                    InvoiceNo = row.Field<string>("InvoiceNo"),
                    InvoiceDate = row.Field<string>("InvoiceDate"),
                    WarehouseName = row.Field<string>("WarehouseName"),
                    SupplierName = row.Field<string>("SupplierName"),
                    PlateNo = row.Field<string>("PlateNo"),
                    Discount = row.Field<decimal>("Discount"),
                    Notes = row.Field<string>("Notes"),
                    FromDate = row.Field<string>("FromDate"),
                    ToDate = row.Field<string>("ToDate"),
                    Location = row.Field<string>("Location"),
                    PurchaseOrderStatus = row.Field<PurchaseOrderStatusEnum>("PurchaseOrderStatus"),
                })],

                ListOutput = [.. reportOutputDataSet.Tables[2].AsEnumerable().Select(row => new PurchaseOrderReportOutputList
                {
                    PurchaseOrderId = row.Field<int>("PurchaseOrderId"),
                    ItemCode = row.Field<string>("ItemCode"),
                    ItemName = row.Field<string>("ItemName"),
                    UnitName = row.Field<string>("UnitName"),
                    Quantity = row.Field<int>("Quantity"),
                    PricePerUnit = row.Field<decimal>("PricePerUnit"),
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
                    var sheetName = $"{mainLevel.ReferenceNo} - {mainLevel.SupplierName}";
                    // Sanitize and truncate sheet name using shared base method
                    sheetName = SanitizeWorksheetName(sheetName);
                    var worksheet = worksheetCounter == 1
                        ? package.Workbook.Worksheets[0]
                        : package.Workbook.Worksheets.Add(sheetName);

                    worksheet.Name = sheetName;

                    var currentRow = SetupReportMainHeader(worksheet, reportOutput.InvoiceHeaderOutput);
                    currentRow = SetupReportSubHeader(worksheet, mainLevel, currentRow);
                    var (nextRow, headerRowIndex) = SetupTableHeader(worksheet, currentRow);
                    currentRow = nextRow;
                    currentRow = PopulateTableData(worksheet, reportOutput.ListOutput, mainLevel.PurchaseOrderId, currentRow);
                    currentRow = AddReportFooter(worksheet, reportOutput.ListOutput, mainLevel, currentRow);
                    AddSignatureSection(worksheet, currentRow, reportOutput.InvoiceHeaderOutput.UserFullName);
                    ConfigureWorksheetLayout(worksheet, headerRowIndex);

                    worksheetCounter++;
                }

                // Save the Excel file
                ExcelByteArray = package.GetAsByteArray();
            }

            return this;
        }

        private int SetupReportMainHeader(ExcelWorksheet worksheet, PurchaseOrderOutputInvoiceHeader invoiceHeader)
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

            // Report Title
            worksheet.Cells["A6"].Value = "PRODUCT STOCK ENTRIES";
            worksheet.Cells["A6:F6"].Merge = true;
            worksheet.Cells["A6"].Style.Font.Size = 14;
            worksheet.Cells["A6"].Style.Font.Bold = true;
            worksheet.Cells["A6"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;

            return 8; // Starting row for next section
        }

        private int SetupReportSubHeader(ExcelWorksheet worksheet, PurchaseOrderReportOutputHeader headerData, int startRow)
        {
            var currentRow = startRow;

            // Make labels bold
            worksheet.Cells[$"A{currentRow}:A{currentRow + 6}"].Style.Font.Bold = true;

            // Reference No
            worksheet.Cells[$"A{currentRow}"].Value = "Reference No:";
            worksheet.Cells[$"B{currentRow}"].Value = headerData.ReferenceNo;
            worksheet.Cells[$"B{currentRow}:F{currentRow}"].Merge = true;
            currentRow++;

            // Supplier
            worksheet.Cells[$"A{currentRow}"].Value = "Supplier:";
            worksheet.Cells[$"B{currentRow}"].Value = headerData.SupplierName;
            worksheet.Cells[$"B{currentRow}:F{currentRow}"].Merge = true;
            currentRow++;

            // Stock Entry Date
            worksheet.Cells[$"A{currentRow}"].Value = "Stock Entry Date:";
            worksheet.Cells[$"B{currentRow}"].Value = headerData.StockEntryDate;
            worksheet.Cells[$"B{currentRow}:F{currentRow}"].Merge = true;
            currentRow++;

            // Invoice Information
            worksheet.Cells[$"A{currentRow}"].Value = "Invoice No:";
            worksheet.Cells[$"B{currentRow}"].Value = headerData.InvoiceNo;
            worksheet.Cells[$"B{currentRow}:F{currentRow}"].Merge = true;
            currentRow++;

            worksheet.Cells[$"A{currentRow}"].Value = "Invoice Date:";
            worksheet.Cells[$"B{currentRow}"].Value = headerData.InvoiceDate;
            worksheet.Cells[$"B{currentRow}:F{currentRow}"].Merge = true;
            currentRow++;

            // Purchase Order Status
            worksheet.Cells[$"A{currentRow}"].Value = "Status:";
            worksheet.Cells[$"B{currentRow}"].Value = headerData.PurchaseOrderStatus.ToString();
            worksheet.Cells[$"B{currentRow}:F{currentRow}"].Merge = true;
            currentRow++;

            // Plate Number
            if (!String.IsNullOrEmpty(headerData.PlateNo))
            {
                worksheet.Cells[$"A{currentRow}"].Value = "Plate No:";
                worksheet.Cells[$"B{currentRow}"].Value = headerData.PlateNo;
                worksheet.Cells[$"B{currentRow}:F{currentRow}"].Merge = true;
                currentRow++;
            }

            return currentRow + 1; // Add extra space before table
        }

        private (int nextRow, int headerRow) SetupTableHeader(ExcelWorksheet worksheet, int startRow)
        {
            var headerRow = startRow;

            // Set header values
            worksheet.Cells[$"A{headerRow}"].Value = "Item Code";
            worksheet.Cells[$"B{headerRow}"].Value = "Item Description";
            worksheet.Cells[$"C{headerRow}"].Value = "Stock Unit";
            worksheet.Cells[$"D{headerRow}"].Value = "Qty";
            worksheet.Cells[$"E{headerRow}"].Value = "Unit Price";
            worksheet.Cells[$"F{headerRow}"].Value = "Unit Amount";

            // Style header row
            worksheet.Cells[$"A{headerRow}:F{headerRow}"].Style.Font.Bold = true;

            // Add table borders for header row
            worksheet.Cells[$"A{headerRow}:F{headerRow}"].Style.Border.Top.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            worksheet.Cells[$"A{headerRow}:F{headerRow}"].Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            worksheet.Cells[$"A{headerRow}:F{headerRow}"].Style.Border.Left.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            worksheet.Cells[$"A{headerRow}:F{headerRow}"].Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;

            // Align column headers
            worksheet.Cells[$"A{headerRow}"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Left;  // Item Code (alphanumeric)
            worksheet.Cells[$"B{headerRow}"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Left;  // Item Description (alphanumeric)
            worksheet.Cells[$"C{headerRow}"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Left;  // Stock Unit (alphanumeric)
            worksheet.Cells[$"D{headerRow}"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right; // Qty (numeric)
            worksheet.Cells[$"E{headerRow}"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right; // Unit Price (numeric)
            worksheet.Cells[$"F{headerRow}"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right; // Unit Amount (numeric)

            return (headerRow + 1, headerRow); // Return next row for data and header row position
        }

        private int PopulateTableData(ExcelWorksheet worksheet, List<PurchaseOrderReportOutputList> listOutput, int purchaseOrderId, int startRow)
        {
            var rowData = listOutput.Where(l => l.PurchaseOrderId == purchaseOrderId).ToList();
            var currentRow = startRow;
            var startDataRow = currentRow;

            foreach (var row in rowData)
            {
                worksheet.Cells[$"A{currentRow}"].Value = row.ItemCode;
                worksheet.Cells[$"B{currentRow}"].Value = row.ItemName;
                worksheet.Cells[$"C{currentRow}"].Value = row.UnitName;
                worksheet.Cells[$"D{currentRow}"].Value = row.Quantity;
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

        private int AddReportFooter(ExcelWorksheet worksheet, List<PurchaseOrderReportOutputList> listOutput, PurchaseOrderReportOutputHeader headerData, int startRow)
        {
            var rowData = listOutput.Where(l => l.PurchaseOrderId == headerData.PurchaseOrderId).ToList();
            var currentRow = startRow;

            // Calculate totals
            int totalQuantity = rowData.Sum(r => r.Quantity);
            decimal grossTotal = rowData.Sum(r => r.Amount);
            decimal discountPercent = headerData.Discount;
            decimal discountAmount = grossTotal * (discountPercent / 100m);
            decimal netTotal = grossTotal - discountAmount;

            // Total Qty
            worksheet.Cells[$"E{currentRow}"].Value = "Total Qty:";
            worksheet.Cells[$"E{currentRow}"].Style.Font.Bold = true;
            worksheet.Cells[$"F{currentRow}"].Value = totalQuantity;
            worksheet.Cells[$"F{currentRow}"].Style.Font.Bold = true;
            currentRow++;

            // Gross Total
            worksheet.Cells[$"E{currentRow}"].Value = "Gross Total:";
            worksheet.Cells[$"E{currentRow}"].Style.Font.Bold = true;
            worksheet.Cells[$"F{currentRow}"].Value = grossTotal;
            worksheet.Cells[$"F{currentRow}"].Style.Numberformat.Format = "#,##0.00";
            worksheet.Cells[$"F{currentRow}"].Style.Font.Bold = true;
            currentRow++;

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

            // Notes (if provided)
            if (!String.IsNullOrEmpty(headerData.Notes))
            {
                currentRow++;
                worksheet.Cells[$"A{currentRow}"].Value = "Notes:";
                worksheet.Cells[$"A{currentRow}"].Style.Font.Bold = true;
                currentRow++;
                worksheet.Cells[$"A{currentRow}"].Value = headerData.Notes;
                worksheet.Cells[$"A{currentRow}:F{currentRow}"].Merge = true;
                worksheet.Cells[$"A{currentRow}"].Style.WrapText = true;
                currentRow++;
            }

            return currentRow + 2; // Add extra space before signatures
        }

        private void AddSignatureSection(ExcelWorksheet worksheet, int startRow, string userFullName)
        {
            var currentRow = startRow;

            // Signature labels
            worksheet.Cells[$"A{currentRow}"].Value = "Printed By:";
            worksheet.Cells[$"A{currentRow}"].Style.Font.Bold = true;
            worksheet.Cells[$"A{currentRow}:B{currentRow}"].Merge = true;

            worksheet.Cells[$"E{currentRow}"].Value = "Checked By:";
            worksheet.Cells[$"E{currentRow}"].Style.Font.Bold = true;
            worksheet.Cells[$"E{currentRow}:F{currentRow}"].Merge = true;
            currentRow++;

            // Signature lines
            worksheet.Cells[$"A{currentRow}"].Value = userFullName;
            worksheet.Cells[$"A{currentRow}:B{currentRow}"].Merge = true;
            worksheet.Cells[$"A{currentRow}:B{currentRow}"].Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            worksheet.Cells[$"A{currentRow}"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet.Cells[$"E{currentRow}:F{currentRow}"].Merge = true;
            worksheet.Cells[$"E{currentRow}:F{currentRow}"].Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            worksheet.Cells[$"E{currentRow}"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            currentRow++;

            // Name & Signature labels
            worksheet.Cells[$"E{currentRow}"].Value = "(Name & Signature)";
            worksheet.Cells[$"E{currentRow}:F{currentRow}"].Merge = true;
            worksheet.Cells[$"E{currentRow}"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            currentRow++;
            currentRow++;
        }

        private void ConfigureWorksheetLayout(ExcelWorksheet worksheet, int headerRowIndex)
        {
            // Auto-fit columns first
            worksheet.Cells.AutoFitColumns();

            // Set specific column widths
            worksheet.Column(1).Width = 15; // Item Code
            worksheet.Column(2).Width = 30; // Item Description
            worksheet.Column(3).Width = 13; // Stock Unit
            worksheet.Column(4).Width = 10; // Qty
            worksheet.Column(5).Width = 30; // Unit Price
            worksheet.Column(6).Width = 15; // Unit Amount

            // Freeze panes to keep headers visible - freeze immediately below the header row
            // First column (A) is index 1, so we use 1 as the column parameter
            worksheet.View.FreezePanes(headerRowIndex + 1, 1);
        }
    }

    public class PurchaseOrderReportOutput : BaseReportOutput
    {
        public PurchaseOrderOutputInvoiceHeader InvoiceHeaderOutput { get; set; }
        public List<PurchaseOrderReportOutputHeader> HeaderOutput { get; set; }
        public List<PurchaseOrderReportOutputList> ListOutput { get; set; }

        public PurchaseOrderReportOutput() : base()
        {
            HeaderOutput = [];
            ListOutput = [];
        }
    }

    public class PurchaseOrderOutputInvoiceHeader
    {
        public string CompanyName { get; set; }
        public string OwnerName { get; set; }
        public string Address { get; set; }
        public string Telephone { get; set; }
        public string FaxTelephone { get; set; }
        public string Tin { get; set; }
        public string UserFullName { get; set; }

        public PurchaseOrderOutputInvoiceHeader()
        {

        }
    }

    public class PurchaseOrderReportOutputHeader
    {
        public int PurchaseOrderId { get; set; }
        public string ReferenceNo { get; set; }
        public string StockEntryDate { get; set; }
        public string InvoiceNo { get; set; }
        public string InvoiceDate { get; set; }
        public string WarehouseName { get; set; }
        public string SupplierName { get; set; }
        public string PlateNo { get; set; }
        public decimal Discount { get; set; }
        public string Notes { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }
        public string Location { get; set; }
        public PurchaseOrderStatusEnum PurchaseOrderStatus { get; set; }

        public PurchaseOrderReportOutputHeader()
        {

        }
    }

    public class PurchaseOrderReportOutputList
    {
        public int PurchaseOrderId { get; set; }
        public string ItemCode { get; set; }
        public string ItemName { get; set; }
        public string UnitName { get; set; }
        public int Quantity { get; set; }
        public decimal PricePerUnit { get; set; }
        public decimal Amount { get; set; }

        public PurchaseOrderReportOutputList()
        {

        }
    }
}
