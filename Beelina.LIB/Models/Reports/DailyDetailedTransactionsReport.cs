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
                ListOutput = reportOutputDataSet.Tables[0].AsEnumerable().Select(row => new DailyDetailedTransactionsReportOutputList
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
                    Amount = row.Field<decimal>("Amount"),
                    Status = row.Field<int>("Status"),
                }).ToList()
            };

            // Add logic here to generate excel file including the excel file saving to the memory stream protected variable.
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using (var package = new ExcelPackage(ReportTemplatePath))
            {
                var worksheet = package.Workbook.Worksheets["Sheet1"];

                var cellNumber = 2;
                foreach (var item in reportOutput.ListOutput)
                {
                    worksheet.Cells[$"A{cellNumber}"].Value = item.StoreName;
                    worksheet.Cells[$"B{cellNumber}"].Value = item.StoreAddress;
                    worksheet.Cells[$"C{cellNumber}"].Value = item.OrderReceived;
                    worksheet.Cells[$"C{cellNumber}"].Style.Numberformat.Format = "yyyy-MM-dd";
                    worksheet.Cells[$"D{cellNumber}"].Value = item.SalesAgentName;
                    worksheet.Cells[$"E{cellNumber}"].Value = item.AreaCovered;
                    worksheet.Cells[$"F{cellNumber}"].Value = item.OutletTypeName;
                    worksheet.Cells[$"H{cellNumber}"].Value = item.PaymentMethod;
                    worksheet.Cells[$"I{cellNumber}"].Value = item.ItemCode;
                    worksheet.Cells[$"J{cellNumber}"].Value = item.ItemName;
                    worksheet.Cells[$"K{cellNumber}"].Value = item.Quantity;
                    worksheet.Cells[$"L{cellNumber}"].Value = item.Amount;
                    worksheet.Cells[$"M{cellNumber}"].Value = item.StatusName;
                    cellNumber++;
                }

                // Save the Excel file
                ExcelByteArray = package.GetAsByteArray();
            }

            return this;
        }
    }

    public class DailyDetailedTransactionsReportOutput : BaseReportOutput
    {
        public List<DailyDetailedTransactionsReportOutputList> ListOutput { get; set; }

        public DailyDetailedTransactionsReportOutput() : base()
        {
            ListOutput = new List<DailyDetailedTransactionsReportOutputList>();
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
        public decimal Amount { get; set; }
        public int Status { get; set; }

        public string OutletTypeName
        {
            get
            {
                return OutletType != 0 ? Enum.GetName(typeof(OutletTypeEnum), OutletType) : String.Empty;
            }
        }

        public string StatusName
        {
            get
            {
                return Enum.GetName(typeof(PaymentStatusEnum), Status);
            }
        }

        public DailyDetailedTransactionsReportOutputList()
        {

        }
    }
}