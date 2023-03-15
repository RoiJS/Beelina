import { Entity } from './entity.model';
import { PaymentMethod } from './payment-method';

export class CustomerStore extends Entity {
  public name: string;
  public address: string;
  public paymentMethod: PaymentMethod;

  constructor() {
    super();
    this.paymentMethod = new PaymentMethod();
  }
}
