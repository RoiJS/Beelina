import { IModelNode } from '../_interfaces/imodel-node';
import { Entity } from './entity.model';

export class SubscriptionFeature extends Entity implements IModelNode {
  public subscriptionId: string;
  public version: string;
  public description: string;

  constructor() {
    super();
    this.id = 0;
  }
}
