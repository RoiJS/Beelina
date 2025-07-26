
namespace Beelina.LIB.Models
{
    public class PaymentDetails
    {
        public int Id { get; set; }
        public int TransactionId { get; set; }
        public string Notes { get; set; }
        public double Amount { get; set; }
        public string PaymentDate { get; set; }
    }
}