using Beelina.LIB.Interfaces;

namespace Beelina.LIB.Models
{
    public class ProductWithdrawalEntry
    : Entity, IUserActionTracker
    {
        public int? UserAccountId { get; set; }
        public DateTime? StockEntryDate { get; set; }
        public string WithdrawalSlipNo { get; set; }
        public string Notes { get; set; }

        public List<ProductStockAudit> ProductStockAudits { get; set; }

        public virtual UserAccount UserAccount { get; set; }

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