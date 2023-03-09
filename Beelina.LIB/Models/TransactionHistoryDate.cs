using Beelina.LIB.Enums;
using Beelina.LIB.Interfaces;

namespace Beelina.LIB.Models
{
    public class TransactionHistoryDate
    {
        public DateTime TransactionDate { get; set; }

        public bool AllTransactionsPaid { get; set; }
    }
}
