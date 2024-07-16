using Beelina.LIB.Interfaces;

namespace Beelina.LIB.Models
{
    public class Payment
        : Entity, IUserActionTracker
    {
        public int TransactionId { get; set; }
        public string Notes { get; set; }
        public double Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public Transaction Transaction { get; set; }

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