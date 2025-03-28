import { NumberFormatter } from '../_helpers/formatters/number-formatter.helper';
import { IModelNode } from '../_interfaces/imodel-node';
import { Entity } from './entity.model';
import { ProductUnit } from './product-unit';

export class Product extends Entity implements IModelNode {
  public name: string;
  public code: string;
  public description: string;
  public supplierId: number;
  public stockQuantity: number;
  public pricePerUnit: number;
  public price: number;
  public productUnit: ProductUnit;
  public deductedStock: number;
  public withdrawalSlipNo: string;
  public plateNo: string;
  public isTransferable: boolean;
  public numberOfUnits: number;
  public isLinkedToSalesAgent: boolean;

  get priceFormatted(): string {
    return NumberFormatter.formatCurrency(this.price);
  }

  get nameWithUnit() {
    return `${this.productUnit.name} - ${this.name}`;
  }

  constructor() {
    super();
    this.productUnit = new ProductUnit();
  }
}
