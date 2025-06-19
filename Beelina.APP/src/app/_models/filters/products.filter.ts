import { PriceStatusEnum } from "src/app/_enum/price-status.enum";
import { StockStatusEnum } from "src/app/_enum/stock-status.enum";

export class ProductsFilter {
  public supplierId: number = 0;
  public stockStatus: StockStatusEnum = StockStatusEnum.None;
  public priceStatus: PriceStatusEnum = PriceStatusEnum.None;

  isActive() {
    return this.supplierId !== 0 ||
      (this.stockStatus !== StockStatusEnum.All && this.stockStatus !== StockStatusEnum.None) ||
      (this.priceStatus !== PriceStatusEnum.All && this.priceStatus !== PriceStatusEnum.None);
  }
}
