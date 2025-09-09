using Beelina.LIB.Enums;

namespace Beelina.LIB.Models
{
    public class UserSetting
        : Entity
    {
        public int UserAccountId { get; set; }
        public UserAccount UserAccount { get; set; }
        public bool AllowOrderPayments { get; set; } = false;
        public bool AllowOrderConfirmation { get; set; } = false;
        public bool AllowSendReceipt { get; set; } = false;
        public bool AllowAutoSendReceipt { get; set; } = false;
        public string SendReceiptEmailAddress { get; set; }
        public bool AllowPrintReceipt { get; set; }
        public bool AutoPrintReceipt { get; set; }
        public PrintReceiptFontSizeEnum PrintReceiptFontSize { get; set; } = PrintReceiptFontSizeEnum.Default;
    }
}