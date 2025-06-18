using Beelina.LIB.Enums;

namespace Beelina.LIB.Models.Filters
{
    public class ProductsFilter
    {
        public int SupplierId { get; set; }
        public ProductStockStatusEnum StockStatus { get; set; }
        public ProductPriceStatusEnum PriceStatus { get; set; }

        /// <summary>
        /// Determines whether the filter has any active criteria set.
        /// </summary>
        /// <returns>True if SupplierId is greater than zero, or if StockStatus or PriceStatus are not set to their respective None values; otherwise, false.</returns>
        public bool IsActive()
        {
            return SupplierId > 0 || StockStatus != ProductStockStatusEnum.None || PriceStatus != ProductPriceStatusEnum.None;
        }
    }
}