using Beelina.LIB.Enums;

namespace Beelina.LIB.Models.Filters
{
    public class TransactionsFilter
    {
        public string DateFrom { get; set; }
        public string DateTo { get; set; }
        public TransactionStatusEnum Status { get; set; }
        public PaymentStatusEnum PaymentStatus { get; set; }
        public int StoreId { get; set; }
        public int SalesAgentId { get; set; }
    }
}