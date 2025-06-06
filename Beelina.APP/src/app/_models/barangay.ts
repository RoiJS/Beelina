import { IModelNode } from '../_interfaces/imodel-node';
import { Entity } from './entity.model';

export class Barangay extends Entity implements IModelNode {
  public name: string;
  public userAccountId: number;

  constructor() {
    super();
    this.id = 0;
    this.name = '';
    this.userAccountId = 0;
  }
}
