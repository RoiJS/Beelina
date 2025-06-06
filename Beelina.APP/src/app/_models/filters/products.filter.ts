import { PriceStatusEnum } from "src/app/_enum/price-status.enum";
import { StockStatusEnum } from "src/app/_enum/stock-status.enum";

export class ProductsFilter {
  public supplierId: number = 0;
  public stockStatus: StockStatusEnum = StockStatusEnum.All;
  public priceStatus: PriceStatusEnum = PriceStatusEnum.All;

  isActive() {
    return this.supplierId !== 0 ||
    this.stockStatus !== StockStatusEnum.All ||
    this.priceStatus !== PriceStatusEnum.All;
  }
}
