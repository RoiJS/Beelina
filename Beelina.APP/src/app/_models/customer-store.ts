import { Entity } from './entity.model';
import { Barangay } from './barangay';
import { PaymentMethod } from './payment-method';
import { OutletTypeEnum } from '../_enum/outlet-type.enum';

export class CustomerStore extends Entity {
  public name: string;
  public address: string;
  public outletType: OutletTypeEnum;
  public paymentMethod: PaymentMethod;
  public barangay: Barangay;

  constructor() {
    super();
    this.paymentMethod = new PaymentMethod();
    this.barangay = new Barangay();
  }
}
