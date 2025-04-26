import { IModelNode } from '../_interfaces/imodel-node';
import { Entity } from './entity.model';

export class ClientSubscription extends Entity implements IModelNode {
  public subscriptionFeatureId: number;
  public startDate: string;
  public endDate: string;

  constructor() {
    super();
    this.id = 0;
    this.subscriptionFeatureId = 0;
  }
}
