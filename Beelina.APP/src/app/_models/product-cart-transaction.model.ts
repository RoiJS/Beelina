import { NumberFormatter } from '../_helpers/formatters/number-formatter.helper';

export class ProductCartTransaction {
  public productName: string;
  public quantity: number;
  public price: number;

  get totalFormatted(): string {
    return NumberFormatter.formatCurrency(this?.total);
  }

  get priceFormatted(): string {
    return NumberFormatter.formatCurrency(this?.price);
  }

  get total(): number {
    return this.quantity * this.price;
  }
}
