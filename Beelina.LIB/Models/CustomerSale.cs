using System.Drawing;
using Beelina.LIB.Enums;

namespace Beelina.LIB.Models
{
    public class CustomerSale
    {
        public int StoreId { get; set; }
        public string StoreName { get; set; }
        public int NumberOfTransactions { get; set; }
        public OutletTypeEnum? OutletType { get; set; }
        public double TotalSalesAmount { get; set; }
    }
}