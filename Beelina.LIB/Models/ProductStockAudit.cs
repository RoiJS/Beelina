using Beelina.LIB.Enums;
using Beelina.LIB.Interfaces;

namespace Beelina.LIB.Models
{
    public class ProductStockAudit
        : Entity, IUserActionTracker
    {
        public int ProductStockPerPanelId { get; set; }
        public int Quantity { get; set; }
        public StockAuditSourceEnum StockAuditSource { get; set; }

        public ProductStockPerPanel ProductStockPerPanel { get; set; }

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
