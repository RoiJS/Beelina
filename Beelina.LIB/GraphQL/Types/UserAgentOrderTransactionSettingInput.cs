namespace Beelina.LIB.GraphQL.Types
{
    public class UserAgentOrderTransactionSettingInput
    {
        public int UserId { get; set; }
        public bool AllowSendReceipt { get; set; } = false;
        public bool AllowAutoSendReceipt { get; set; } = false;
        public string SendReceiptEmailAddress { get; set; }
        public bool AllowPrintReceipt { get; set; } = false;
        public bool AutoPrintReceipt { get; set; } = false;
    }
}