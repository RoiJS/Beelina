using Beelina.LIB.Enums;

namespace Beelina.LIB.Models
{
    public class ProductStockAuditItem
    {
        public int Id { get; set; } // Product Stock Id or Transaction Id
        public string TransactionNumber { get; set; } // Either Withdrawal Slip No or Transaction No.
        public string PlateNo { get; set; }
        public int Quantity { get; set; }
        public StockAuditSourceEnum StockAuditSource { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime ModifiedDate { get; set; }
    }
}
