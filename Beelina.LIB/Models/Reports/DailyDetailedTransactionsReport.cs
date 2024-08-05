using Beelina.LIB.BusinessLogic;
using Beelina.LIB.Enums;
using Beelina.LIB.Interfaces;
using OfficeOpenXml;
using ReserbizAPP.LIB.Helpers.Services;
using System.Data;

namespace Beelina.LIB.Models.Reports
{
    public class DailyDetailedTransactionsReport<TOutput>
        : BaseReport<TOutput>, IBaseReport<TOutput> where TOutput : BaseReportOutput, new()
    {
        public DailyDetailedTransactionsReport(int reportId, int userId, string userFullName, List<ControlValues> controlValues, EmailService emailService, ReportRepository reportRepository)
            : base(reportId, userId, userFullName, controlValues, emailService, reportRepository)
        {

        }

        public DailyDetailedTransactionsReport() : base()
        {

        }

        public IBaseReport<TOutput> GenerateAsExcel()
        {
            var reportOutputDataSet = GenerateReportData();

            var reportOutput = new DailyDetailedTransactionsReportOutput
            {
                HeaderOutput = reportOutputDataSet.Tables[0].AsEnumerable().Select(row => new DailyDetailedTransactionsReportOutputHeader
                {
                    SalesAgentName = row.Field<string>("SalesAgentName"),
                    Date = row.Field<string>("Date"),
                }).FirstOrDefault(),

                ListOutput = [.. reportOutputDataSet.Tables[1].AsEnumerable().Select(row => new DailyDetailedTransactionsReportOutputList
                {
                    StoreName = row.Field<string>("StoreName"),
                    StoreAddress = row.Field<string>("StoreAddress"),
                    OrderReceived = row.Field<DateTime>("OrderReceived"),
                    SalesAgentName = row.Field<string>("SalesAgentName"),
                    AreaCovered = row.Field<string>("AreaCovered"),
                    PaymentMethod = row.Field<string>("PaymentMethod"),
                    OutletType = row.Field<int>("OutletType"),
                    DateCreated = row.Field<DateTime>("DateCreated"),
                    ItemCode = row.Field<string>("ItemCode"),
                    ItemName = row.Field<string>("ItemName"),
                    PricePerUnit = row.Field<decimal>("PricePerUnit"),
                    Quantity = row.Field<int>("Quantity"),
                    ReturnItems = row.Field<int>("ReturnItems"),
                    Amount = row.Field<decimal>("Amount"),
                    PaidStatus = row.Field<int>("PaidStatus"),
                    OrderStatus = row.Field<int>("OrderStatus"),
                })],

                FooterOutput = reportOutputDataSet.Tables[2].AsEnumerable().Select(row => new DailyDetailedTransactionsReportOutputFooter
                {
                    TotalPaidAmount = row.Field<decimal>("TotalPaidAmount"),
                    TotalUnpaidAmount = row.Field<decimal>("TotalUnpaidAmount"),
                }).FirstOrDefault(),
            };

            // Add logic here to generate excel file including the excel file saving to the memory stream protected variable.
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using (var package = new ExcelPackage(ReportTemplatePath))
            {
                var worksheet = package.Workbook.Worksheets["Sheet1"];

                worksheet.Cells["B1"].Value = reportOutput.HeaderOutput.SalesAgentName;
                worksheet.Cells["B2"].Value = reportOutput.HeaderOutput.Date;

                var cellNumber = 6;
                foreach (var item in reportOutput.ListOutput)
                {
                    worksheet.Cells[$"A{cellNumber}"].Value = item.StoreName;
                    worksheet.Cells[$"B{cellNumber}"].Value = item.StoreAddress;
                    worksheet.Cells[$"C{cellNumber}"].Value = item.OrderReceived;
                    worksheet.Cells[$"C{cellNumber}"].Style.Numberformat.Format = "yyyy-MM-dd";
                    worksheet.Cells[$"D{cellNumber}"].Value = item.SalesAgentName;
                    worksheet.Cells[$"E{cellNumber}"].Value = item.AreaCovered;
                    worksheet.Cells[$"F{cellNumber}"].Value = item.OutletTypeName;
                    worksheet.Cells[$"G{cellNumber}"].Value = item.PaymentMethod;
                    worksheet.Cells[$"H{cellNumber}"].Value = item.ItemCode;
                    worksheet.Cells[$"I{cellNumber}"].Value = item.ItemName;
                    worksheet.Cells[$"J{cellNumber}"].Value = item.PricePerUnit;
                    worksheet.Cells[$"K{cellNumber}"].Value = item.Quantity;
                    worksheet.Cells[$"L{cellNumber}"].Value = item.ReturnItems;
                    worksheet.Cells[$"M{cellNumber}"].Value = item.Amount;
                    worksheet.Cells[$"N{cellNumber}"].Value = item.OrderStatusStatusName;
                    worksheet.Cells[$"O{cellNumber}"].Value = item.PaidStatusName;
                    cellNumber++;
                }

                cellNumber++;
                worksheet.Cells[$"N{cellNumber}"].Value = "Total Paid Amount:";
                worksheet.Cells[$"N{cellNumber}"].Style.Font.Bold = true;
                worksheet.Cells[$"O{cellNumber}"].Value = reportOutput.FooterOutput.TotalPaidAmount;
                worksheet.Cells[$"O{cellNumber}"].Style.Numberformat.Format = "#,##0.00";

                cellNumber++;
                worksheet.Cells[$"N{cellNumber}"].Value = "Total Unpaid Amount:";
                worksheet.Cells[$"N{cellNumber}"].Style.Font.Bold = true;
                worksheet.Cells[$"O{cellNumber}"].Value = reportOutput.FooterOutput.TotalUnpaidAmount;
                worksheet.Cells[$"O{cellNumber}"].Style.Numberformat.Format = "#,##0.00";

                // Lock the worksheet
                LockReport(package, worksheet);

                // Save the Excel file
                ExcelByteArray = package.GetAsByteArray();
            }

            return this;
        }
    }

    public class DailyDetailedTransactionsReportOutput : BaseReportOutput
    {
        public DailyDetailedTransactionsReportOutputHeader HeaderOutput { get; set; }
        public List<DailyDetailedTransactionsReportOutputList> ListOutput { get; set; }
        public DailyDetailedTransactionsReportOutputFooter FooterOutput { get; set; }

        public DailyDetailedTransactionsReportOutput() : base()
        {
            ListOutput = [];
        }
    }

    public class DailyDetailedTransactionsReportOutputHeader
    {
        public string SalesAgentName { get; set; }
        public string Date { get; set; }

        public DailyDetailedTransactionsReportOutputHeader()
        {

        }
    }

    public class DailyDetailedTransactionsReportOutputList
    {
        public string StoreName { get; set; }
        public string StoreAddress { get; set; }
        public DateTime OrderReceived { get; set; }
        public string SalesAgentName { get; set; }
        public string AreaCovered { get; set; }
        public int? OutletType { get; set; }
        public string PaymentMethod { get; set; }
        public DateTime DateCreated { get; set; }
        public string ItemCode { get; set; }
        public string ItemName { get; set; }
        public decimal PricePerUnit { get; set; }
        public int Quantity { get; set; }
        public int ReturnItems { get; set; }
        public decimal Amount { get; set; }
        public int OrderStatus { get; set; }
        public int PaidStatus { get; set; }

        public string OutletTypeName
        {
            get
            {
                return OutletType != 0 ? Enum.GetName(typeof(OutletTypeEnum), OutletType) : String.Empty;
            }
        }

        public string OrderStatusStatusName
        {
            get
            {
                return Enum.GetName(typeof(TransactionStatusEnum), OrderStatus);
            }
        }

        public string PaidStatusName
        {
            get
            {
                return Enum.GetName(typeof(PaymentStatusEnum), PaidStatus);
            }
        }

        public DailyDetailedTransactionsReportOutputList()
        {

        }
    }

    public class DailyDetailedTransactionsReportOutputFooter
    {
        public decimal TotalPaidAmount { get; set; }
        public decimal TotalUnpaidAmount { get; set; }

        public DailyDetailedTransactionsReportOutputFooter()
        {

        }
    }
}