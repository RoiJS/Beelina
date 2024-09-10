import { ILocalEntity } from 'src/app/_interfaces/ilocal-entity.interface';

export class LocalProductUnit implements ILocalEntity {

  public customerUserId: number; // Reference to LocalCustomerUser.id
  public id: number;
  public productUnitId: number;
  public name: string;

  constructor() {
  }

}
