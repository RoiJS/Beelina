import { IModelNode } from '../_interfaces/imodel-node';
import { Entity } from './entity.model';

export class ProductUnit extends Entity implements IModelNode {
  public name: string;

  constructor() {
    super();
  }
}
