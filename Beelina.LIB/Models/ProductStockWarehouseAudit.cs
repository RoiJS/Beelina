using Beelina.LIB.Enums;
using Beelina.LIB.Interfaces;

namespace Beelina.LIB.Models
{
    public class ProductStockWarehouseAudit
    : Entity, IUserActionTracker
    {
        public int ProductStockPerWarehouseId { get; set; }
        public int Quantity { get; set; }
        public string PurchaseOrderNumber { get; set; }
        public StockAuditSourceEnum StockAuditSource { get; set; }
        public ProductStockPerWarehouse ProductStockPerWarehouse { get; set; }
        public int SourceProductStockPerWarehouseId { get; set; }
        public int SourceProductNumberOfUnits { get; set; }
        public int DestinationProductStockPerWarehouseId { get; set; }
        public TransferProductStockTypeEnum TransferProductStockType { get; set; }

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