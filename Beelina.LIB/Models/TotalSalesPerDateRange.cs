namespace Beelina.LIB.Models
{
    public class TotalSalesPerDateRange
        : DateRange
    {
        public double TotalSales { get; set; }
        public double ChequeAmountOnHand { get; set; }
        public double CashAmountOnHand { get; set; }
        public double TotalAmountOnHand => ChequeAmountOnHand + CashAmountOnHand;
    }
}