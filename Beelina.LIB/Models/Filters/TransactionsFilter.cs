using Beelina.LIB.Enums;

namespace Beelina.LIB.Models.Filters
{
    public class TransactionsFilter
    {
        public string TransactionDate { get; set; }
        public TransactionStatusEnum Status { get; set; }
        public PaymentStatusEnum PaymentStatus { get; set; }
        public int StoreId { get; set; }
    }
}