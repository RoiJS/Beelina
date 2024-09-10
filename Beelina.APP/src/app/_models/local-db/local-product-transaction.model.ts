import { ILocalEntity } from 'src/app/_interfaces/ilocal-entity.interface';

export class LocalProductTransaction implements ILocalEntity {

  public customerUserId: number; // Reference to LocalCustomerUser.id
  public id: number;
  public transactionId: number;
  public code: string;
  public productId: number;
  public productName: string;
  public price: number;
  public quantity: number;
  public currentQuantity: number;

  constructor() {
  }

}
