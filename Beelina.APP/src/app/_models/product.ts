import { NumberFormatter } from '../_helpers/formatters/number-formatter.helper';
import { IModelNode } from '../_interfaces/imodel-node';
import { Entity } from './entity.model';
import { ProductUnit } from './product-unit';

export class Product extends Entity implements IModelNode {
  public name: string;
  public code: string;
  public description: string;
  public stockQuantity: number;
  public pricePerUnit: number;
  public price: number;
  public productUnit: ProductUnit;
  public deductedStock: number;
  public withdrawalSlipNo: string;

  get priceFormatted(): string {
    return NumberFormatter.formatCurrency(this.price);
  }

  constructor() {
    super();
    this.productUnit = new ProductUnit();
  }
}
