import { Entity } from './entity.model';

export class Client extends Entity {
  public name: string;
  public dbName: string;
  public dbHashName: string;
  public contactNumber: string;

  constructor() {
    super();
    this.name = "";
    this.dbName = "";
    this.dbHashName = "";
    this.contactNumber = "";
  }
}
