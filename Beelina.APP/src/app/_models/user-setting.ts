import { Entity } from './entity.model';
import { PrintReceiptFontSizeEnum } from '../_enum/print-receipt-font-size.enum';

export class UserSetting extends Entity {
  allowOrderConfirmation: boolean = true;
  allowOrderPayments: boolean = true;
  allowSendReceipt: boolean = false;
  sendReceiptEmailAddress: string = '';
  allowAutoSendReceipt: boolean = false;
  allowPrintReceipt: boolean = false;
  autoPrintReceipt: boolean = false;
  printReceiptFontSize: PrintReceiptFontSizeEnum = PrintReceiptFontSizeEnum.Default;
}
