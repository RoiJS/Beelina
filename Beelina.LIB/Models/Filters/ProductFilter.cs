using Beelina.LIB.Enums;

namespace Beelina.LIB.Models.Filters
{
    public class ProductsFilter
    {
        public int SupplierId { get; set; }
        public ProductStockStatusEnum StockStatus { get; set; }
        public ProductPriceStatusEnum PriceStatus { get; set; }
        public bool? Parent { get; set; }
        public ProductActiveStatusEnum ActiveStatus { get; set; } = ProductActiveStatusEnum.ActiveOnly;

        public bool IsActive()
        {
            return SupplierId > 0 || StockStatus != ProductStockStatusEnum.None || PriceStatus != ProductPriceStatusEnum.None || Parent.HasValue || ActiveStatus != ProductActiveStatusEnum.ActiveOnly;
        }
    }
}