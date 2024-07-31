namespace Beelina.LIB.GraphQL.Types
{
    public class PaymentInput
    {
        public int TransactionId { get; set; }
        public double Amount { get; set; }
        public string Notes { get; set; }
        public string PaymentDate { get; set; }
    }
}
