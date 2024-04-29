using Beelina.LIB.Enums;
using Beelina.LIB.Interfaces;

namespace Beelina.LIB.Models
{
    public class Transaction
        : Entity, IUserActionTracker
    {
        public int StoreId { get; set; }
        public DateTime TransactionDate { get; set; }
        public DateTime DueDate { get; set; }
        public Store Store { get; set; }
        public TransactionStatusEnum Status { get; set; }
        public int ModeOfPayment { get; set; }
        public int WarehouseId { get; set; } = 1; // Default to the first warehouse

        public List<ProductTransaction> ProductTransactions { get; set; } = new List<ProductTransaction>();
        public string InvoiceNo { get; set; }
        public double Discount { get; set; }

        public bool HasUnpaidProductTransaction
        {
            get
            {
                return ProductTransactions.Any(p => p.Status == PaymentStatusEnum.Unpaid);
            }
        }

        public double Balance
        {
            get
            {
                return (double)ProductTransactions.Where(p => p.Status == PaymentStatusEnum.Unpaid).Sum(s => s.Quantity * s.Price);
            }
        }

        public double Total
        {
            get
            {
                return (double)ProductTransactions.Sum(s => s.Quantity * s.Price);
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
