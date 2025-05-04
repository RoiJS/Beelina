export interface IUserAgentOrderTransactionSettingsInput {
  userId: number;
  allowSendReceipt: boolean;
  allowAutoSendReceipt: boolean;
  sendReceiptEmailAddress: string;
  allowPrintReceipt: boolean;
  autoPrintReceipt: boolean;
}
