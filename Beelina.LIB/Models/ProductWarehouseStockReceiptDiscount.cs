using Beelina.LIB.Interfaces;

namespace Beelina.LIB.Models
{
    public class ProductWarehouseStockReceiptDiscount : Entity, IUserActionTracker
    {
        public int ProductWarehouseStockReceiptEntryId { get; set; }
        public double DiscountPercentage { get; set; }
        public int DiscountOrder { get; set; } // Order of application (1st, 2nd, etc.)
        public string Description { get; set; }

        public virtual ProductWarehouseStockReceiptEntry ProductWarehouseStockReceiptEntry { get; set; }

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