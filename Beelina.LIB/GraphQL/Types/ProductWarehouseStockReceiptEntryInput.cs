using Beelina.LIB.Enums;

namespace Beelina.LIB.GraphQL.Types
{
    public class ProductWarehouseStockReceiptEntryInput
    {
        public int Id { get; set; }
        public int SupplierId { get; set; }
        public string StockEntryDate { get; set; }
        public string ReferenceNo { get; set; }
        public string PlateNo { get; set; }
        public int WarehouseId { get; set; }
        public string Notes { get; set; }
        public double Discount { get; set; }
        public string InvoiceNo { get; set; }
        public string InvoiceDate { get; set; }
        public string DateEncoded { get; set; }
        public PurchaseOrderStatusEnum PurchaseOrderStatus { get; set; }
        public string Location { get; set; }
        public List<ProductStockWarehouseAuditInput> ProductStockWarehouseAuditInputs { get; set; }
    }
}
