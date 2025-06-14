using Beelina.LIB.Enums;

namespace Beelina.LIB.Models.Filters
{
    public class ProductsFilter
    {
        public int SupplierId { get; set; }
        public ProductStockStatusEnum StockStatus { get; set; }
        public ProductPriceStatusEnum PriceStatus { get; set; }

        public bool IsActive()
        {
            return SupplierId > 0 || StockStatus != ProductStockStatusEnum.None || PriceStatus != ProductPriceStatusEnum.None;
        }
    }
}