using Beelina.LIB.BusinessLogic;
using Beelina.LIB.Enums;
using Beelina.LIB.Helpers.Services;
using Beelina.LIB.Interfaces;
using OfficeOpenXml;
using System.Data;

namespace Beelina.LIB.Models.Reports
{
    public class SupplierProductTransactionsReport<TOutput>
        : BaseReport<TOutput>, IBaseReport<TOutput> where TOutput : BaseReportOutput, new()
    {
        public SupplierProductTransactionsReport(int reportId, int userId, string userFullName, List<ControlValues> controlValues, EmailService emailService, ReportRepository reportRepository)
            : base(reportId, userId, userFullName, controlValues, emailService, reportRepository)
        {

        }

        public SupplierProductTransactionsReport() : base()
        {

        }

        public IBaseReport<TOutput> GenerateAsExcel()
        {
            var reportOutputDataSet = GenerateReportData();

            var reportOutput = new SupplierProductTransactionsReportOutput
            {
                InvoiceHeaderOutput = reportOutputDataSet.Tables[0].AsEnumerable().Select(row => new SupplierProductTransactionsReportOutputInvoiceHeader
                {
                    CompanyName = row.Field<string>("CompanyName"),
                    OwnerName = row.Field<string>("OwnerName"),
                    Address = row.Field<string>("Address"),
                    Telephone = row.Field<string>("Telephone"),
                    FaxTelephone = row.Field<string>("FaxTelephone"),
                    Tin = row.Field<string>("Tin"),
                    UserFullName = row.Field<string>("UserFullName"),
                }).FirstOrDefault(),

                HeaderOutput = reportOutputDataSet.Tables[1].AsEnumerable().Select(row => new SupplierProductTransactionsReportOutputHeader
                {
                    SupplierName = row.Field<string>("SupplierName"),
                    FromDate = row.Field<string>("FromDate"),
                    ToDate = row.Field<string>("ToDate"),
                    OrderStatusFilter = row.Field<string>("OrderStatusFilter"),
                }).FirstOrDefault(),

                ListOutput = [.. reportOutputDataSet.Tables[2].AsEnumerable().Select(row => new SupplierProductTransactionsReportOutputList
                {
                    TransactionDate = row.Field<DateTime>("TransactionDate"),
                    SalesAgentName = row.Field<string>("SalesAgentName"),
                    OutletType = row.Field<int>("OutletType"),
                    StoreName = row.Field<string>("StoreName"),
                    BarangayName = row.Field<string>("BarangayName"),
                    ProductDescription = row.Field<string>("ProductDescription"),
                    Quantity = row.Field<int>("Quantity"),
                    UnitName = row.Field<string>("UnitName"),
                    PricePerUnit = row.Field<decimal>("PricePerUnit"),
                    Amount = row.Field<decimal>("Amount"),
                })]
            };

            // Add logic here to generate excel file including the excel file saving to the memory stream protected variable.
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using (var package = new ExcelPackage())
            {
                package.Workbook.Worksheets.Add("Sheet1"); // Default sheet
                var worksheet = package.Workbook.Worksheets[0];
                worksheet.Name = "Supplier Product Transactions";

                var currentRow = SetupReportMainHeader(worksheet, reportOutput.InvoiceHeaderOutput);
                currentRow = SetupReportSubHeader(worksheet, reportOutput.HeaderOutput, currentRow);
                var (nextRow, headerRowIndex) = SetupTableHeader(worksheet, currentRow);
                currentRow = nextRow;
                currentRow = PopulateTableData(worksheet, reportOutput.ListOutput, currentRow);
                // AddSignatureSection(worksheet, currentRow, reportOutput.InvoiceHeaderOutput.UserFullName);
                ConfigureWorksheetLayout(worksheet, headerRowIndex);

                // Lock the worksheet
                LockReport(package, worksheet);

                // Save the Excel file
                ExcelByteArray = package.GetAsByteArray();
            }

            return this;
        }

        private int SetupReportMainHeader(ExcelWorksheet worksheet, SupplierProductTransactionsReportOutputInvoiceHeader invoiceHeader)
        {
            // Company Name
            worksheet.Cells["A1"].Value = invoiceHeader.CompanyName;
            worksheet.Cells["A1:I1"].Merge = true;
            worksheet.Cells["A1"].Style.Font.Size = 20;
            worksheet.Cells["A1"].Style.Font.Bold = true;
            worksheet.Cells["A1"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;

            // Owner Name
            worksheet.Cells["A2"].Value = invoiceHeader.OwnerName;
            worksheet.Cells["A2:I2"].Merge = true;
            worksheet.Cells["A2"].Style.Font.Italic = true;
            worksheet.Cells["A2"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;

            // Address
            worksheet.Cells["A3"].Value = invoiceHeader.Address;
            worksheet.Cells["A3:I3"].Merge = true;
            worksheet.Cells["A3"].Style.Font.Italic = true;
            worksheet.Cells["A3"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;

            // Telephone and Fax
            var telephone = String.IsNullOrEmpty(invoiceHeader.Telephone) ? "" : $"Telephone: {invoiceHeader.Telephone};";
            var faxTelephone = String.IsNullOrEmpty(invoiceHeader.FaxTelephone) ? "" : $"Fax Tel: {invoiceHeader.FaxTelephone}";
            worksheet.Cells["A4"].Value = $"{telephone} {faxTelephone}";
            worksheet.Cells["A4:I4"].Merge = true;
            worksheet.Cells["A4"].Style.Font.Italic = true;
            worksheet.Cells["A4"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;

            // TIN
            var tin = String.IsNullOrEmpty(invoiceHeader.Tin) ? "" : $"Tin: {invoiceHeader.Tin}";
            worksheet.Cells["A5"].Value = tin;
            worksheet.Cells["A5:I5"].Merge = true;
            worksheet.Cells["A5"].Style.Font.Italic = true;
            worksheet.Cells["A5"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;

            // Report Title
            worksheet.Cells["A7"].Value = "SUPPLIER PRODUCT TRANSACTIONS REPORT";
            worksheet.Cells["A7:I7"].Merge = true;
            worksheet.Cells["A7"].Style.Font.Size = 14;
            worksheet.Cells["A7"].Style.Font.Bold = true;
            worksheet.Cells["A7"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;

            return 9; // Starting row for next section
        }

        private int SetupReportSubHeader(ExcelWorksheet worksheet, SupplierProductTransactionsReportOutputHeader headerData, int startRow)
        {
            var currentRow = startRow;

            // Supplier filter
            worksheet.Cells[$"A{currentRow}"].Value = "Supplier:";
            worksheet.Cells[$"A{currentRow}"].Style.Font.Bold = true;
            worksheet.Cells[$"B{currentRow}"].Value = headerData.SupplierName ?? "All Suppliers";
            worksheet.Cells[$"B{currentRow}:I{currentRow}"].Merge = true;
            currentRow++;

            // Order Status filter
            worksheet.Cells[$"A{currentRow}"].Value = "Order Status:";
            worksheet.Cells[$"A{currentRow}"].Style.Font.Bold = true;
            worksheet.Cells[$"B{currentRow}"].Value = headerData.OrderStatusFilter;
            worksheet.Cells[$"B{currentRow}:I{currentRow}"].Merge = true;
            currentRow++;

            // Date range
            worksheet.Cells[$"A{currentRow}"].Value = "Period:";
            worksheet.Cells[$"A{currentRow}"].Style.Font.Bold = true;
            worksheet.Cells[$"B{currentRow}"].Value = $"{headerData.FromDate} to {headerData.ToDate}";
            worksheet.Cells[$"B{currentRow}:I{currentRow}"].Merge = true;
            currentRow++;

            // Skip a row
            currentRow++;

            return currentRow;
        }

        private (int nextRow, int headerRow) SetupTableHeader(ExcelWorksheet worksheet, int startRow)
        {
            var headerRow = startRow;

            // Set header values
            worksheet.Cells[$"A{headerRow}"].Value = "Date";
            worksheet.Cells[$"B{headerRow}"].Value = "Salesman";
            worksheet.Cells[$"C{headerRow}"].Value = "Outlet Type";
            worksheet.Cells[$"D{headerRow}"].Value = "Account Name";
            worksheet.Cells[$"E{headerRow}"].Value = "Product Description";
            worksheet.Cells[$"F{headerRow}"].Value = "Quantity";
            worksheet.Cells[$"G{headerRow}"].Value = "Unit";
            worksheet.Cells[$"H{headerRow}"].Value = "Price";
            worksheet.Cells[$"I{headerRow}"].Value = "Amount";

            // Style header row
            worksheet.Cells[$"A{headerRow}:I{headerRow}"].Style.Font.Bold = true;
            worksheet.Cells[$"A{headerRow}:I{headerRow}"].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
            worksheet.Cells[$"A{headerRow}:I{headerRow}"].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
            worksheet.Cells[$"A{headerRow}:I{headerRow}"].Style.Border.BorderAround(OfficeOpenXml.Style.ExcelBorderStyle.Thin);

            // Set column alignments based on data type
            worksheet.Cells[$"A{headerRow}"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Left;  // Date
            worksheet.Cells[$"B{headerRow}"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Left;  // Sales Agent Name
            worksheet.Cells[$"C{headerRow}"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Left;  // Outlet Type
            worksheet.Cells[$"D{headerRow}"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Left;  // Store Name - Barangay Name
            worksheet.Cells[$"E{headerRow}"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Left;  // Product Description
            worksheet.Cells[$"F{headerRow}"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right; // Quantity (numeric)
            worksheet.Cells[$"G{headerRow}"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Left;  // Unit
            worksheet.Cells[$"H{headerRow}"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right; // Price Per Unit (numeric)
            worksheet.Cells[$"I{headerRow}"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right; // Amount (numeric)

            return (headerRow + 1, headerRow);
        }

        private int PopulateTableData(ExcelWorksheet worksheet, List<SupplierProductTransactionsReportOutputList> listOutput, int startRow)
        {
            var currentRow = startRow;
            var startDataRow = currentRow;

            foreach (var row in listOutput)
            {
                worksheet.Cells[$"A{currentRow}"].Value = row.TransactionDate.ToString("yyyy-MM-dd");
                worksheet.Cells[$"B{currentRow}"].Value = row.SalesAgentName;
                worksheet.Cells[$"C{currentRow}"].Value = row.OutletTypeName;
                worksheet.Cells[$"D{currentRow}"].Value = $"{row.StoreName} - {row.BarangayName}";
                worksheet.Cells[$"E{currentRow}"].Value = row.ProductDescription;
                worksheet.Cells[$"F{currentRow}"].Value = row.Quantity;
                worksheet.Cells[$"G{currentRow}"].Value = row.UnitName;
                worksheet.Cells[$"H{currentRow}"].Value = row.PricePerUnit;
                worksheet.Cells[$"I{currentRow}"].Value = row.Amount;

                // Format numeric cells
                worksheet.Cells[$"F{currentRow}"].Style.Numberformat.Format = "#,##0";
                worksheet.Cells[$"H{currentRow}"].Style.Numberformat.Format = "#,##0.00";
                worksheet.Cells[$"I{currentRow}"].Style.Numberformat.Format = "#,##0.00";

                // Add borders to data rows
                worksheet.Cells[$"A{currentRow}:I{currentRow}"].Style.Border.BorderAround(OfficeOpenXml.Style.ExcelBorderStyle.Thin);

                currentRow++;
            }

            // Apply borders to the entire data range
            if (listOutput.Any())
            {
                worksheet.Cells[$"A{startDataRow}:I{currentRow - 1}"].Style.Border.Top.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                worksheet.Cells[$"A{startDataRow}:I{currentRow - 1}"].Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                worksheet.Cells[$"A{startDataRow}:I{currentRow - 1}"].Style.Border.Left.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                worksheet.Cells[$"A{startDataRow}:I{currentRow - 1}"].Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            }

            // Skip a row
            currentRow++;

            return currentRow;
        }

        private void AddSignatureSection(ExcelWorksheet worksheet, int startRow, string userFullName)
        {
            var currentRow = startRow + 2; // Skip some rows

            worksheet.Cells[$"A{currentRow}"].Value = "Generated by:";
            worksheet.Cells[$"A{currentRow}"].Style.Font.Bold = true;
            worksheet.Cells[$"B{currentRow}"].Value = userFullName;
            currentRow++;

            worksheet.Cells[$"A{currentRow}"].Value = "Date Generated:";
            worksheet.Cells[$"A{currentRow}"].Style.Font.Bold = true;
            worksheet.Cells[$"B{currentRow}"].Value = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
        }

        private void ConfigureWorksheetLayout(ExcelWorksheet worksheet, int headerRowIndex)
        {
            // Auto-fit columns
            worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();

            // Set minimum column widths
            worksheet.Column(1).Width = 15; // Date of Transaction
            worksheet.Column(2).Width = 20; // Sales Agent Name
            worksheet.Column(3).Width = 15; // Outlet Type
            worksheet.Column(4).Width = 30; // Store Name - Barangay Name
            worksheet.Column(5).Width = 30; // Product Description
            worksheet.Column(6).Width = 10; // Quantity
            worksheet.Column(7).Width = 10; // Unit
            worksheet.Column(8).Width = 15; // Price Per Unit
            worksheet.Column(9).Width = 15; // Amount

            // Freeze the header row
            worksheet.View.FreezePanes(headerRowIndex + 1, 1);
        }
    }

    public class SupplierProductTransactionsReportOutput : BaseReportOutput
    {
        public SupplierProductTransactionsReportOutputInvoiceHeader InvoiceHeaderOutput { get; set; }
        public SupplierProductTransactionsReportOutputHeader HeaderOutput { get; set; }
        public List<SupplierProductTransactionsReportOutputList> ListOutput { get; set; }

        public SupplierProductTransactionsReportOutput() : base()
        {
            ListOutput = [];
        }
    }

    public class SupplierProductTransactionsReportOutputInvoiceHeader
    {
        public string CompanyName { get; set; }
        public string OwnerName { get; set; }
        public string Address { get; set; }
        public string Telephone { get; set; }
        public string FaxTelephone { get; set; }
        public string Tin { get; set; }
        public string UserFullName { get; set; }

        public SupplierProductTransactionsReportOutputInvoiceHeader()
        {

        }
    }

    public class SupplierProductTransactionsReportOutputHeader
    {
        public string SupplierName { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }
        public string OrderStatusFilter { get; set; }

        public SupplierProductTransactionsReportOutputHeader()
        {

        }
    }

    public class SupplierProductTransactionsReportOutputList
    {
        public DateTime TransactionDate { get; set; }
        public string SalesAgentName { get; set; }
        public int OutletType { get; set; }
        public string StoreName { get; set; }
        public string BarangayName { get; set; }
        public string ProductDescription { get; set; }
        public int Quantity { get; set; }
        public string UnitName { get; set; }
        public decimal PricePerUnit { get; set; }
        public decimal Amount { get; set; }

        public string OutletTypeName
        {
            get
            {
                return OutletType != 0 ? Enum.GetName(typeof(OutletTypeEnum), OutletType) : String.Empty;
            }
        }

        public SupplierProductTransactionsReportOutputList()
        {

        }
    }
}
