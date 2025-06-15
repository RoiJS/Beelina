import { PrintReceiptFontSizeEnum } from 'src/app/_enum/print-receipt-font-size.enum';

export interface IUserAgentOrderTransactionSettingsInput {
  userId: number;
  allowSendReceipt: boolean;
  allowAutoSendReceipt: boolean;
  sendReceiptEmailAddress: string;
  allowPrintReceipt: boolean;
  autoPrintReceipt: boolean;
  printReceiptFontSize: PrintReceiptFontSizeEnum;
}
