import { Entity } from './entity.model';
import { Barangay } from './barangay';
import { PaymentMethod } from './payment-method';

export class CustomerStore extends Entity {
  public name: string;
  public address: string;
  public paymentMethod: PaymentMethod;
  public barangay: Barangay;

  constructor() {
    super();
    this.paymentMethod = new PaymentMethod();
    this.barangay = new Barangay();
  }
}
