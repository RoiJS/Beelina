import { Entity } from './entity.model';

export class UserSetting extends Entity {
  allowOrderConfirmation: boolean;
  allowOrderPayments: boolean;
}
