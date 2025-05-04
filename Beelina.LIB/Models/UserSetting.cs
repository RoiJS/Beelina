namespace Beelina.LIB.Models
{
    public class UserSetting
        : Entity
    {
        public int UserAccountId { get; set; }
        public UserAccount UserAccount { get; set; }
        public bool AllowOrderPayments { get; set; } = true;
        public bool AllowOrderConfirmation { get; set; } = true;
        public bool AllowSendReceipt { get; set; } = false;
        public bool AllowAutoSendReceipt { get; set; } = false;
        public string SendReceiptEmailAddress { get; set; }
        public bool AllowPrintReceipt { get; set; }
        public bool AutoPrintReceipt { get; set; }
    }
}