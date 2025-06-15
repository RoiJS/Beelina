import { IQueryPayload } from './iquery.payload';
import { PrintReceiptFontSizeEnum } from 'src/app/_enum/print-receipt-font-size.enum';

export interface IUserAgentOrderTransactionQueryPayload extends IQueryPayload {
  allowSendReceipt: boolean;
  allowAutoSendReceipt: boolean;
  sendReceiptEmailAddress: string;
  allowPrintReceipt: boolean;
  autoPrintReceipt: boolean;
  printReceiptFontSize: PrintReceiptFontSizeEnum;
}
