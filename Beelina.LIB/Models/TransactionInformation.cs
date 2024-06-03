using Beelina.LIB.Enums;

namespace Beelina.LIB.Models
{
    public class TransactionInformation
    {
        public int Id { get; set; }
        public string InvoiceNo { get; set; }
        public int? CreatedById { get; set; }
        public string CreatedBy { get; set; }
        public TransactionStatusEnum Status { get; set; }
        public int StoreId { get; set; }
        public string StoreName { get; set; }
        public string BarangayName { get; set; }
        public DateTime TransactionDate { get; set; }
        public bool HasUnpaidProductTransaction { get; set; }
        public DateTime DetailsDateUpdated { get; set; }
        public string DetailsUpdatedBy { get; set; }
        public DateTime OrderItemsDateUpdated { get; set; }
        public string OrderItemsUpdatedBy { get; set; }

        public DateTime FinalDateUpdated
        {
            get
            {
                return DetailsDateUpdated > OrderItemsDateUpdated ? DetailsDateUpdated : OrderItemsDateUpdated;
            }
        }
    }
}
