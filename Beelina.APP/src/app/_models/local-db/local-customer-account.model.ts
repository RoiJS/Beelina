import { ILocalEntity } from 'src/app/_interfaces/ilocal-entity.interface';

export class LocalCustomerAccount implements ILocalEntity {

  public customerUserId: number; // Reference to LocalCustomerUser.id
  public id: number;
  public barangayId: number;
  public name: string;

  constructor() {
    this.barangayId = 0;
    this.name = "";
  }

}
