export class StoreWithoutOrder {
  public storeId: number;
  public storeName: string;
  public storeCode: string;
  public address: string;
  public salesAgentId: number;
  public salesAgentName: string;
  public lastOrderDate: Date;
  public daysSinceLastOrder: number;
  public suggestedTargetSales: number;
  public historicalAverageSales: number;

  constructor() {
    this.storeId = 0;
    this.storeName = '';
    this.storeCode = '';
    this.address = '';
    this.salesAgentId = 0;
    this.salesAgentName = '';
    this.lastOrderDate = new Date();
    this.daysSinceLastOrder = 0;
    this.suggestedTargetSales = 0;
    this.historicalAverageSales = 0;
  }

  get storeNameWithCode(): string {
    return `${this.storeCode} - ${this.storeName}`;
  }

  get lastOrderDateFormatted(): string {
    return this.lastOrderDate ? this.lastOrderDate.toLocaleDateString() : 'Never';
  }

  get urgencyLevel(): 'low' | 'medium' | 'high' | 'critical' {
    if (this.daysSinceLastOrder >= 30) return 'critical';
    if (this.daysSinceLastOrder >= 21) return 'high';
    if (this.daysSinceLastOrder >= 14) return 'medium';
    return 'low';
  }

  get urgencyColor(): string {
    switch (this.urgencyLevel) {
      case 'critical':
        return '#D32F2F'; // Dark Red
      case 'high':
        return '#F44336'; // Red
      case 'medium':
        return '#FF9800'; // Orange
      case 'low':
        return '#4CAF50'; // Green
      default:
        return '#9E9E9E'; // Gray
    }
  }
}
