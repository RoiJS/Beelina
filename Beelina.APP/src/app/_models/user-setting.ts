import { Entity } from './entity.model';

export class UserSetting extends Entity {
  allowOrderConfirmation: boolean;
  allowOrderPayments: boolean;
  allowSendReceipt: boolean;
  sendReceiptEmailAddress: string;
  allowAutoSendReceipt: boolean;
  allowPrintReceipt: boolean;
  autoPrintReceipt: boolean;
}
