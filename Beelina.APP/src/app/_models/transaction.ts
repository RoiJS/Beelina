import { PaymenStatusEnum } from '../_enum/payment-status.enum';
import { NumberFormatter } from '../_helpers/formatters/number-formatter.helper';
import { IModelNode } from '../_interfaces/imodel-node';
import { Entity } from './entity.model';
import { Product } from './product';

export class ProductTransaction extends Entity implements IModelNode {
  public code: string;
  public productId: number;
  public productName: string;
  public quantity: number;
  public currentQuantity: number;
  public price: number;
  public status: PaymenStatusEnum;
  public product: Product;

  get isPaid(): boolean {
    return this.status === PaymenStatusEnum.Paid;
  }

  get priceFormatted(): string {
    return NumberFormatter.formatCurrency(this.price);
  }
}
