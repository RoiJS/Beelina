namespace Beelina.LIB.Dtos
{
    public class UserAgentOrderTransactionSettingsDto
    {
        public bool AllowSendReceipt { get; set; } = false;
        public bool AllowAutoSendReceipt { get; set; } = false;
        public string SendReceiptEmailAddress { get; set; }
    }
}