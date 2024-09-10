import { ILocalEntity } from 'src/app/_interfaces/ilocal-entity.interface';

export class LocalPaymentMethod implements ILocalEntity {

  public customerUserId: number; // Reference to LocalCustomerUser.id
  public id: number;
  public paymentMethodId: number;
  public name: string;

  constructor() {
    this.paymentMethodId = 0;
    this.name = "";
  }

}
