export class ProfitBreakdown {
  public purchaseOrderDiscountProfit: number;
  public salesPriceProfit: number;
  public totalProfit: number;
  public purchaseOrderDiscountProfitPercentage: number;
  public salesPriceProfitPercentage: number;

  constructor() {
    this.purchaseOrderDiscountProfit = 0;
    this.salesPriceProfit = 0;
    this.totalProfit = 0;
    this.purchaseOrderDiscountProfitPercentage = 0;
    this.salesPriceProfitPercentage = 0;
  }
}
