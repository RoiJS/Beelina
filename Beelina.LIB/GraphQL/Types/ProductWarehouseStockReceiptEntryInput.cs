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
        public List<ProductStockWarehouseAuditInput> ProductStockWarehouseAuditInputs { get; set; }
    }
}
