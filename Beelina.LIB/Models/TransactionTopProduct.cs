using Beelina.LIB.Enums;
using Beelina.LIB.Interfaces;

namespace Beelina.LIB.Models
{
    public class TransactionTopProduct
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public string UnitName { get; set; }
        public int Id { get; set; }
        public int Count { get; set; }
        public double TotalAmount { get; set; }
    }
}
