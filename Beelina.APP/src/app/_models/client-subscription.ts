import { IModelNode } from '../_interfaces/imodel-node';
import { Entity } from './entity.model';

export class ClientSubscription extends Entity implements IModelNode {
  public clientId: number;
  public subscriptionFeatureId: number;
  public startDate: string;
  public endDate: string;

  constructor() {
    super();
    this.id = 0;
    this.subscriptionFeatureId = 0;
    this.clientId = 0;
  }
}
