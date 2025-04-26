import { IModelNode } from '../_interfaces/imodel-node';
import { Entity } from './entity.model';

export class Subscription extends Entity implements IModelNode {
  public name: string;
  public description: string;

  constructor() {
    super();
    this.id = 0;
  }
}
