using Beelina.LIB.Enums;

namespace Beelina.LIB.GraphQL.Types
{
    public class ProductStockWarehouseAuditInput
    {
        public int Id { get; set; }
        public int ProductStockPerWarehouseId { get; set; }
        public int Quantity { get; set; }
        public StockAuditSourceEnum StockAuditSource { get; set; } = StockAuditSourceEnum.OrderFromSupplier;
    }
}
