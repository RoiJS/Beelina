import { IModelNode } from '../_interfaces/imodel-node';
import { Entity } from './entity.model';

export class Supplier extends Entity implements IModelNode {
  public code: string;
  public name: string;

  constructor() {
    super();
    this.id = 0;
    this.code = '';
    this.name = '';
  }

  get nameWithCode() {
    return `${this.code} - ${this.name}`;
  }
}
