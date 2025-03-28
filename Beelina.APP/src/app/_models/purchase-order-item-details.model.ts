import { NumberFormatter } from "../_helpers/formatters/number-formatter.helper";

export class PurchaseOrderItemDetails {
  public id: number = 0;
  public productId: number;
  public code: string;
  public name: string;
  public productStockPerWarehouseId: number;
  public unit: string;
  public quantity: number = 0;
  public unitPrice: number = 0;
  public amount: number = 0;

  get formattedUnitPrice() {
    return NumberFormatter.formatCurrency(this.unitPrice);
  }

  get formattedAmount() {
    return NumberFormatter.formatCurrency(this.amount);
  }
}
