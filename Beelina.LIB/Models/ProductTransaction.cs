using Beelina.LIB.Enums;
using Beelina.LIB.Interfaces;

namespace Beelina.LIB.Models
{
    public class ProductTransaction
        : Entity, IUserActionTracker
    {
        public int TransactionId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public double Price { get; set; }
        public PaymentStatusEnum Status { get; set; } = PaymentStatusEnum.Unpaid;

        public Transaction Transaction { get; set; }
        public Product Product { get; set; }

        public double CurrentQuantity
        {
            get
            {
                return Quantity;
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
