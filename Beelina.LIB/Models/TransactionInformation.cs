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
        public string DetailsDateUpdated { get; set; }
        public string DetailsUpdatedBy { get; set; }
        public string OrderItemsDateUpdated { get; set; }
        public string OrderItemsUpdatedBy { get; set; }
        public double Total { get; set; }
        public double Discount { get; set; }
        public double BadOrderAmount { get; set; }
        public PaymentStatusEnum PaymentStatus { get; set; }

        public DateTime FinalDateUpdated
        {
            get
            {
                DateTime detailsDate = DateTime.TryParse(DetailsDateUpdated, out var dDate) ? dDate : DateTime.MinValue;
                DateTime orderItemsDate = DateTime.TryParse(OrderItemsDateUpdated, out var oDate) ? oDate : DateTime.MinValue;
                return detailsDate > orderItemsDate ? detailsDate : orderItemsDate;
            }
        }
    }
}
