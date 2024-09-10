namespace Beelina.LIB.Models
{
    public class TransactionSales
    {
        public double TotalSalesAmount { get; set; }
        public double ChequeAmountOnHand { get; set; }
        public double CashAmountOnHand { get; set; }
        public double BadOrderAmount { get; set; }
        public double AccountReceivables { get; set; }
        public double TotalAmountOnHand => ChequeAmountOnHand + CashAmountOnHand;
    }
}
