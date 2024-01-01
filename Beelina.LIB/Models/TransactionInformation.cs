namespace Beelina.LIB.Models
{
    public class TransactionInformation
    {
        public int Id { get; set; }
        public string InvoiceNo { get; set; }
        public int StoreId { get; set; }
        public string StoreName { get; set; }
        public DateTime TransactionDate { get; set; }
        public bool HasUnpaidProductTransaction { get; set; }
    }
}
