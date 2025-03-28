using System.Drawing;

namespace Beelina.LIB.Models.Filters
{
    public class ProductReceiptEntryFilter
    {
        public int WarehouseId { get; set; }
        public int SupplierId { get; set; }
        public string DateFrom { get; set; }
        public string DateTo { get; set; }
    }
}