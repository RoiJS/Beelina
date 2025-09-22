import { IProductWarehouseStockReceiptDiscountInput } from '../_interfaces/inputs/product-warehouse-stock-receipt-discount-input.interface';

export class ProductWarehouseStockReceiptDiscount implements IProductWarehouseStockReceiptDiscountInput {
  id: number = 0;
  discountPercentage: number = 0;
  discountOrder: number = 1;
  description: string = '';

  constructor(data?: IProductWarehouseStockReceiptDiscountInput) {
    if (data) {
      this.id = data.id;
      this.discountPercentage = data.discountPercentage;
      this.discountOrder = data.discountOrder;
      this.description = data.description;
    }
  }
}
