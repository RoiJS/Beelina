namespace Beelina.LIB.Models
{
    public class TransactionSalesPerSalesAgent
    {
        public int Id { get; set; }
        public string SalesAgentName { get; set; }
        public double Sales { get; set; }
        public double ChequeAmountOnHand { get; set; }
        public double CashAmountOnHand { get; set; }
        public double TotalAmountOnHand => ChequeAmountOnHand + CashAmountOnHand;
    }
}
