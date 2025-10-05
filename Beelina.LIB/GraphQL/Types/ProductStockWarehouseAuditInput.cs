using Beelina.LIB.Enums;

namespace Beelina.LIB.GraphQL.Types
{
    public class ProductStockWarehouseAuditInput : IEntityInput
    {
        public int Id { get; set; }
        public int ProductStockPerWarehouseId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public int ProductWarehouseStockReceiptEntryId { get; set; }
        public float PricePerUnit { get; set; }
        public float CostPrice { get; set; }
        public DateTime? ExpirationDate { get; set; }
        public StockAuditSourceEnum StockAuditSource { get; set; }
    }

    public interface IEntityInput
    {
        public int Id { get; set; }
    }
}
