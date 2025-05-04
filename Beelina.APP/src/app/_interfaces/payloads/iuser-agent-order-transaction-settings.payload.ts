import { IQueryPayload } from './iquery.payload';

export interface IUserAgentOrderTransactionQueryPayload extends IQueryPayload {
  allowSendReceipt: boolean;
  allowAutoSendReceipt: boolean;
  sendReceiptEmailAddress: string;
  allowPrintReceipt: boolean;
  autoPrintReceipt: boolean;
}
