import { PrintReceiptFontSizeEnum } from 'src/app/_enum/print-receipt-font-size.enum';

export class UserAgentOrderTransactionSettings {
  userId: number;
  allowSendReceipt: boolean;
  allowAutoSendReceipt: boolean;
  sendReceiptEmailAddress: string;
  allowPrintReceipt: boolean;
  autoPrintReceipt: boolean;
  printReceiptFontSize: PrintReceiptFontSizeEnum;

  constructor() {
    this.userId = 0;
    this.allowSendReceipt = false;
    this.allowAutoSendReceipt = false;
    this.sendReceiptEmailAddress = '';
    this.allowPrintReceipt = false;
    this.autoPrintReceipt = false;
    this.printReceiptFontSize = PrintReceiptFontSizeEnum.Default;
  }
}
