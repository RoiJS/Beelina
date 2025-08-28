using Beelina.LIB.BusinessLogic;
using Beelina.LIB.Helpers.Services;
using Beelina.LIB.Interfaces;
using OfficeOpenXml;
using System.Data;

namespace Beelina.LIB.Models.Reports
{
    public class ProductsPerSupplierReport<TOutput>
        : BaseReport<TOutput>, IBaseReport<TOutput> where TOutput : BaseReportOutput, new()
    {
        public ProductsPerSupplierReport(int reportId, int userId, string userFullName, List<ControlValues> controlValues, EmailService emailService, ReportRepository reportRepository)
            : base(reportId, userId, userFullName, controlValues, emailService, reportRepository)
        {

        }

        public ProductsPerSupplierReport() : base()
        {

        }

        public IBaseReport<TOutput> GenerateAsExcel()
        {
            var reportOutputDataSet = GenerateReportData();

            var reportOutput = new ProductsPerSupplierReportOutput
            {
                InvoiceHeaderOutput = reportOutputDataSet.Tables[0].AsEnumerable().Select(row => new ProductsPerSupplierOutputInvoiceHeader
                {
                    CompanyName = row.Field<string>("CompanyName"),
                    OwnerName = row.Field<string>("OwnerName"),
                    Address = row.Field<string>("Address"),
                    Telephone = row.Field<string>("Telephone"),
                    FaxTelephone = row.Field<string>("FaxTelephone"),
                    Tin = row.Field<string>("Tin"),
                    UserFullName = row.Field<string>("UserFullName"),
                }).FirstOrDefault(),

                ListOutput = [.. reportOutputDataSet.Tables[1].AsEnumerable().Select(row => new ProductsPerSupplierReportOutputList
                {
                    ProductCode = row.Field<string>("ProductCode"),
                    ProductDescription = row.Field<string>("ProductDescription"),
                    Unit = row.Field<string>("Unit"),
                    PricePerUnit = row.Field<decimal>("PricePerUnit"),
                    SupplierName = row.Field<string>("SupplierName"),
                })]
            };

            // Add logic here to generate excel file including the excel file saving to the memory stream protected variable.
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("Products per Supplier");

                var currentRow = SetupReportMainHeader(worksheet, reportOutput.InvoiceHeaderOutput);
                var (nextRow, headerRowIndex) = SetupTableHeader(worksheet, currentRow);
                currentRow = nextRow;
                currentRow = PopulateTableData(worksheet, reportOutput.ListOutput, currentRow);
                ConfigureWorksheetLayout(worksheet, headerRowIndex);

                // Save the Excel file
                ExcelByteArray = package.GetAsByteArray();
            }

            return this;
        }

        private int SetupReportMainHeader(ExcelWorksheet worksheet, ProductsPerSupplierOutputInvoiceHeader invoiceHeader)
        {
            // Company Name
            worksheet.Cells["A1"].Value = invoiceHeader.CompanyName;
            worksheet.Cells["A1:E1"].Merge = true;
            worksheet.Cells["A1"].Style.Font.Size = 20;
            worksheet.Cells["A1"].Style.Font.Bold = true;
            worksheet.Cells["A1"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;

            // Owner Name
            worksheet.Cells["A2"].Value = invoiceHeader.OwnerName;
            worksheet.Cells["A2:E2"].Merge = true;
            worksheet.Cells["A2"].Style.Font.Italic = true;
            worksheet.Cells["A2"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;

            // Address
            worksheet.Cells["A3"].Value = invoiceHeader.Address;
            worksheet.Cells["A3:E3"].Merge = true;
            worksheet.Cells["A3"].Style.Font.Italic = true;
            worksheet.Cells["A3"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;

            // Telephone and Fax
            var telephone = String.IsNullOrEmpty(invoiceHeader.Telephone) ? "" : $"Telephone: {invoiceHeader.Telephone};";
            var faxTelephone = String.IsNullOrEmpty(invoiceHeader.FaxTelephone) ? "" : $"Fax Tel: {invoiceHeader.FaxTelephone}";
            worksheet.Cells["A4"].Value = $"{telephone} {faxTelephone}";
            worksheet.Cells["A4:E4"].Merge = true;
            worksheet.Cells["A4"].Style.Font.Italic = true;
            worksheet.Cells["A4"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;

            // TIN
            var tin = String.IsNullOrEmpty(invoiceHeader.Tin) ? "" : $"Tin: {invoiceHeader.Tin}";
            worksheet.Cells["A5"].Value = tin;
            worksheet.Cells["A5:E5"].Merge = true;
            worksheet.Cells["A5"].Style.Font.Italic = true;
            worksheet.Cells["A5"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;

            // Report Title
            worksheet.Cells["A7"].Value = "PRODUCTS PER SUPPLIER REPORT";
            worksheet.Cells["A7:E7"].Merge = true;
            worksheet.Cells["A7"].Style.Font.Size = 14;
            worksheet.Cells["A7"].Style.Font.Bold = true;
            worksheet.Cells["A7"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;

            return 9; // Starting row for next section
        }

        private (int nextRow, int headerRow) SetupTableHeader(ExcelWorksheet worksheet, int startRow)
        {
            var headerRow = startRow;

            // Set header values
            worksheet.Cells[$"A{headerRow}"].Value = "Product Code";
            worksheet.Cells[$"B{headerRow}"].Value = "Product Description";
            worksheet.Cells[$"C{headerRow}"].Value = "Unit";
            worksheet.Cells[$"D{headerRow}"].Value = "Price Per Unit";
            worksheet.Cells[$"E{headerRow}"].Value = "Supplier";

            // Style header row
            worksheet.Cells[$"A{headerRow}:E{headerRow}"].Style.Font.Bold = true;

            // Add table borders for header row
            worksheet.Cells[$"A{headerRow}:E{headerRow}"].Style.Border.Top.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            worksheet.Cells[$"A{headerRow}:E{headerRow}"].Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            worksheet.Cells[$"A{headerRow}:E{headerRow}"].Style.Border.Left.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            worksheet.Cells[$"A{headerRow}:E{headerRow}"].Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;

            // Align column headers
            worksheet.Cells[$"A{headerRow}"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Left;  // Product Code
            worksheet.Cells[$"B{headerRow}"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Left;  // Product Description
            worksheet.Cells[$"C{headerRow}"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Left;  // Unit
            worksheet.Cells[$"D{headerRow}"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right; // Price Per Unit
            worksheet.Cells[$"E{headerRow}"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Left;  // Supplier

            return (headerRow + 1, headerRow); // Return next row for data and header row position
        }

        private int PopulateTableData(ExcelWorksheet worksheet, List<ProductsPerSupplierReportOutputList> listOutput, int startRow)
        {
            var currentRow = startRow;
            var startDataRow = currentRow;

            foreach (var row in listOutput)
            {
                worksheet.Cells[$"A{currentRow}"].Value = row.ProductCode;
                worksheet.Cells[$"B{currentRow}"].Value = row.ProductDescription;
                worksheet.Cells[$"C{currentRow}"].Value = row.Unit;
                worksheet.Cells[$"D{currentRow}"].Value = row.PricePerUnit;
                worksheet.Cells[$"E{currentRow}"].Value = row.SupplierName;

                // Format currency column
                worksheet.Cells[$"D{currentRow}"].Style.Numberformat.Format = "#,##0.00";

                currentRow++;
            }

            // Add table borders for data rows
            if (listOutput.Count > 0)
            {
                worksheet.Cells[$"A{startDataRow}:E{currentRow - 1}"].Style.Border.Top.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                worksheet.Cells[$"A{startDataRow}:E{currentRow - 1}"].Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                worksheet.Cells[$"A{startDataRow}:E{currentRow - 1}"].Style.Border.Left.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                worksheet.Cells[$"A{startDataRow}:E{currentRow - 1}"].Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
            }

            return currentRow + 1; // Add space after table
        }

        private void ConfigureWorksheetLayout(ExcelWorksheet worksheet, int headerRowIndex)
        {
            // Auto-fit columns first
            worksheet.Cells.AutoFitColumns();

            // Set specific column widths
            worksheet.Column(1).Width = 15; // Product Code
            worksheet.Column(2).Width = 40; // Product Description
            worksheet.Column(3).Width = 15; // Unit
            worksheet.Column(4).Width = 20; // Price Per Unit
            worksheet.Column(5).Width = 25; // Supplier

            // Freeze panes to keep headers visible - freeze immediately below the header row
            worksheet.View.FreezePanes(headerRowIndex + 1, 1);
        }
    }

    public class ProductsPerSupplierReportOutput : BaseReportOutput
    {
        public ProductsPerSupplierOutputInvoiceHeader InvoiceHeaderOutput { get; set; }
        public List<ProductsPerSupplierReportOutputList> ListOutput { get; set; }

        public ProductsPerSupplierReportOutput() : base()
        {
            InvoiceHeaderOutput = new ProductsPerSupplierOutputInvoiceHeader();
            ListOutput = [];
        }
    }

    public class ProductsPerSupplierOutputInvoiceHeader
    {
        public string CompanyName { get; set; }
        public string OwnerName { get; set; }
        public string Address { get; set; }
        public string Telephone { get; set; }
        public string FaxTelephone { get; set; }
        public string Tin { get; set; }
        public string UserFullName { get; set; }

        public ProductsPerSupplierOutputInvoiceHeader()
        {

        }
    }

    public class ProductsPerSupplierReportOutputList
    {
        public string ProductCode { get; set; }
        public string ProductDescription { get; set; }
        public string Unit { get; set; }
        public decimal PricePerUnit { get; set; }
        public string SupplierName { get; set; }

        public ProductsPerSupplierReportOutputList()
        {

        }
    }
}
