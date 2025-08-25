using Beelina.LIB.Enums;
using Beelina.LIB.Interfaces;

namespace Beelina.LIB.Models
{
    public class ProductWarehouseStockReceiptEntry
    : Entity, IUserActionTracker
    {
        public int? SupplierId { get; set; }
        public DateTime? StockEntryDate { get; set; }
        public string ReferenceNo { get; set; }
        public string PlateNo { get; set; }
        public string Notes { get; set; }
        public int WarehouseId { get; set; }
        public double Discount { get; set; }
        public string InvoiceNo { get; set; }
        public DateTime? InvoiceDate { get; set; }
        public DateTime? DateEncoded { get; set; }
        public PurchaseOrderStatusEnum PurchaseOrderStatus { get; set; }
        public string Location { get; set; }

        public List<ProductStockWarehouseAudit> ProductStockWarehouseAudits { get; set; }
        public virtual Supplier Supplier { get; set; }

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