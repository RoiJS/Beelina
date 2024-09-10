import { ILocalEntity } from 'src/app/_interfaces/ilocal-entity.interface';

export class LocalProduct implements ILocalEntity {

  public customerUserId: number; // Reference to LocalCustomerUser.id
  public id: number;
  public productId: number;
  public name: string;
  public code: string;
  public description: string;
  public supplierId: number;
  public stockQuantity: number;
  public pricePerUnit: number;
  public price: number;
  public isTransferable: boolean;
  public numberOfUnits: number;
  public productUnitId: number;

  constructor() {
  }

}
