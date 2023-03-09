using Beelina.LIB.Enums;
using Beelina.LIB.Interfaces;

namespace Beelina.LIB.Models
{
    public class Transaction
        : Entity, IUserActionTracker
    {
        public int StoreId { get; set; }
        public DateTime TransactionDate { get; set; }
        public Store Store { get; set; }

        public List<ProductTransaction> ProductTransactions { get; set; } = new List<ProductTransaction>();

        public bool HasUnpaidProductTransaction
        {
            get
            {
                return ProductTransactions.Any(p => p.Status == PaymentStatusEnum.Unpaid);
            }
        }

        public int? DeletedById { get; set; }
        public virtual UserAccount DeletedBy { get; set; }
        public int? UpdatedById { get; set; }
        public virtual UserAccount UpdatedBy { get; set; }
        public int? CreatedById { get; set; }
        public virtual UserAccount CreatedBy { get; set; }
        public int? DeactivatedById { get; set; }
        public virtual UserAccount DeactivatedBy { get; set; }
    }
}
