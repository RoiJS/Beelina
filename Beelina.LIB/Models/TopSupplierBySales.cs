namespace Beelina.LIB.Models
{
    public class TopSupplierBySales
    {
        public int SupplierId { get; set; }
        public string SupplierName { get; set; }
        public string SupplierCode { get; set; }
        public double TotalSalesAmount { get; set; }
        public int TotalProductsSold { get; set; }
        public int TotalTransactions { get; set; }
        public string TotalSalesAmountFormatted
        {
            get
            {
                return TotalSalesAmount.ToString("₱#,##0.00");
            }
        }
    }
}