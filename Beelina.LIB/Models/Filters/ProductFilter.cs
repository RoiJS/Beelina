using Beelina.LIB.Enums;

namespace Beelina.LIB.Models.Filters
{
    public class ProductsFilter
    {
        public int SupplierId { get; set; }
        public ProductStockStatusEnum StockStatus {get; set; } 
        public ProductPriceStatusEnum PriceStatus {get; set; } 
    }
}