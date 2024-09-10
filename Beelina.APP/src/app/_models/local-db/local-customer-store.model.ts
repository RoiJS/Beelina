import { ILocalEntity } from 'src/app/_interfaces/ilocal-entity.interface';

export class LocalCustomerStore implements ILocalEntity {

  public customerUserId: number; // Reference to LocalCustomerUser.id
  public id: number;
  public customerId: number;
  public name: string;
  public address: string;
  public emailAddress: string;
  public outletType: number;
  public paymentMethodId: number;
  public barangayId: number;

  constructor() {
    this.barangayId = 0;
    this.name = '';
  }

}
