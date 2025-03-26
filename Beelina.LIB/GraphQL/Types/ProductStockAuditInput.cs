using Beelina.LIB.Enums;

namespace Beelina.LIB.GraphQL.Types
{
    public class ProductStockAuditInput : IEntityInput
    {
        public int Id { get; set; }
        public int? ProductStockPerPanelId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public float PricePerUnit { get; set; }
        public int WarehouseId { get; set; }
        public StockAuditSourceEnum StockAuditSource { get; set; } = StockAuditSourceEnum.FromWithdrawal;
    }
}
