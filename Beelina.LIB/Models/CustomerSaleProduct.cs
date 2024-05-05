using System.Drawing;

namespace Beelina.LIB.Models
{
    public class CustomerSaleProduct
    {
        public int ProductId { get; set; }
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public string Unit { get; set; }
        public double TotalSalesAmount { get; set; }
    }
}