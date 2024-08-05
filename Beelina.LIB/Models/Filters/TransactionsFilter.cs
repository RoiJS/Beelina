using Beelina.LIB.Enums;

namespace Beelina.LIB.Models.Filters
{
    public class TransactionsFilter
    {
        public string TransactionDate { get; set; }
        public TransactionStatusEnum Status { get; set; }
    }
}