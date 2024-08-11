using Beelina.LIB.BusinessLogic;
using Beelina.LIB.Enums;
using Beelina.LIB.Interfaces;
using OfficeOpenXml;
using OfficeOpenXml.Style;
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
                InvoiceHeaderOutput = reportOutputDataSet.Tables[0].AsEnumerable().Select(row => new CustomerCollectionSummaryReportOutputInvoiceHeader
                {
                    CompanyName = row.Field<string>("CompanyName"),
                    OwnerName = row.Field<string>("OwnerName"),
                    Address = row.Field<string>("Address"),
                    Telephone = row.Field<string>("Telephone"),
                    FaxTelephone = row.Field<string>("FaxTelephone"),
                    Tin = row.Field<string>("Tin"),
                }).FirstOrDefault(),

                CustomerOutput = [.. reportOutputDataSet.Tables[1].AsEnumerable().Select(row => new CustomerCollectionSummaryReportOutputCustomer
                {
                    Id = row.Field<int>("Id"),
                    Name = row.Field<string>("Name"),
                    BarangayName = row.Field<string>("BarangayName"),
                })],

                ListOutput = [.. reportOutputDataSet.Tables[2].AsEnumerable().Select(row => new CustomerCollectionSummaryReportOutputList
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

                var mainRowLevel = 10;
                var categories = reportOutput.CustomerOutput.DistinctBy(x => x.BarangayName).Select(x => x.BarangayName);

                // Report Header
                worksheet.Cells[$"A1"].Value = reportOutput.InvoiceHeaderOutput.CompanyName;
                worksheet.Cells[$"A2"].Value = reportOutput.InvoiceHeaderOutput.OwnerName;
                worksheet.Cells[$"A3"].Value = reportOutput.InvoiceHeaderOutput.Address;
                var telephone = String.IsNullOrEmpty(reportOutput.InvoiceHeaderOutput.Telephone) ? "" : $"Telephone: {reportOutput.InvoiceHeaderOutput.Telephone};";
                var faxTelephone = String.IsNullOrEmpty(reportOutput.InvoiceHeaderOutput.FaxTelephone) ? "" : $"Fax Tel: {reportOutput.InvoiceHeaderOutput.FaxTelephone}";
                worksheet.Cells[$"A4"].Value = $"{telephone} {faxTelephone}";

                var tin = String.IsNullOrEmpty(reportOutput.InvoiceHeaderOutput.Tin) ? "" : $"Tin: {reportOutput.InvoiceHeaderOutput.Tin}";
                worksheet.Cells[$"A5"].Value = tin;

                foreach (var category in categories)
                {
                    var cellNumber = mainRowLevel;
                    worksheet.Cells[$"A{mainRowLevel}"].Value = category;
                    worksheet.Cells[$"A{mainRowLevel}:G{mainRowLevel}"].Merge = true;
                    worksheet.Cells[$"A{mainRowLevel}"].Style.Font.Bold = true;
                    worksheet.Cells[$"A{mainRowLevel}"].Style.Font.Italic = true;
                    worksheet.Cells[$"A{mainRowLevel}"].Style.Font.UnderLine = true;

                    cellNumber++;
                    var mainLevelItems = reportOutput.CustomerOutput.Where(l => l.BarangayName == category).ToList();

                    foreach (var mainLevel in mainLevelItems)
                    {
                        // (4) Setup Row Data
                        worksheet.Cells[$"A{cellNumber}"].Value = mainLevel.Name;

                        var rowData = reportOutput.ListOutput.Where(l => l.StoreId == mainLevel.Id).ToList();

                        foreach (var row in rowData)
                        {
                            worksheet.Cells[$"B{cellNumber}"].Value = row.TransactionDate;
                            worksheet.Cells[$"C{cellNumber}"].Value = row.InvoiceNo;
                            worksheet.Cells[$"D{cellNumber}"].Value = row.NetAmount;
                            worksheet.Cells[$"E{cellNumber}"].Value = row.Payments == 0 ? string.Empty : row.Payments;
                            worksheet.Cells[$"F{cellNumber}"].Value = row.Balance == 0 ? string.Empty : row.Balance;
                            worksheet.Cells[$"G{cellNumber}"].Value = row.BadOrder == 0 ? string.Empty : row.BadOrder;

                            worksheet.Cells[$"B{cellNumber}"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                            worksheet.Cells[$"C{cellNumber}"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;
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

                        var cellRange = worksheet.Cells[$"B{cellNumber}:G{cellNumber}"];
                        cellRange.Style.Border.Top.Style = ExcelBorderStyle.Medium;
                        cellRange.Style.Border.Bottom.Style = ExcelBorderStyle.Medium;

                        cellNumber += 3;
                        mainRowLevel += 3;

                        var startMerge = mainRowLevel - rowData.Count - 2;
                        var endMerge = mainRowLevel - 1;
                        worksheet.Cells[$"A{startMerge}:A{endMerge}"].Merge = true;
                        worksheet.Cells[$"A{startMerge}:A{endMerge}"].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Top;

                        worksheet.Column(2).Width = 13;
                        worksheet.Column(4).Width = 15;
                        worksheet.Column(5).Width = 15;
                        worksheet.Column(6).Width = 15;
                    }
                }

                worksheet.View.FreezePanes(10, 7);

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
        public CustomerCollectionSummaryReportOutputInvoiceHeader InvoiceHeaderOutput { get; set; }
        public List<CustomerCollectionSummaryReportOutputCustomer> CustomerOutput { get; set; }
        public List<CustomerCollectionSummaryReportOutputList> ListOutput { get; set; }

        public CustomerCollectionSummaryReportOutput() : base()
        {
            CustomerOutput = [];
            ListOutput = [];
        }
    }

    public class CustomerCollectionSummaryReportOutputInvoiceHeader
    {
        public string CompanyName { get; set; }
        public string OwnerName { get; set; }
        public string Address { get; set; }
        public string Telephone { get; set; }
        public string FaxTelephone { get; set; }
        public string Tin { get; set; }

        public CustomerCollectionSummaryReportOutputInvoiceHeader()
        {

        }
    }

    public class CustomerCollectionSummaryReportOutputCustomer
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string BarangayName { get; set; }

        public CustomerCollectionSummaryReportOutputCustomer()
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