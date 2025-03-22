namespace Beelina.LIB.Models.Filters
{
    public class ProductWithdrawalFilter
    {
        public int UserAccountId { get; set; }
        public string DateFrom { get; set; }
        public string DateTo { get; set; }
    }
}