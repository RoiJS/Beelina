export class TopSupplierBySales {
  public supplierId: number;
  public supplierName: string;
  public supplierCode: string;
  public totalSalesAmount: number;
  public totalProductsSold: number;
  public totalTransactions: number;
  public totalSalesAmountFormatted: string;

  constructor(data?: Partial<TopSupplierBySales>) {
    this.supplierId = data?.supplierId || 0;
    this.supplierName = data?.supplierName || '';
    this.supplierCode = data?.supplierCode || '';
    this.totalSalesAmount = data?.totalSalesAmount || 0;
    this.totalProductsSold = data?.totalProductsSold || 0;
    this.totalTransactions = data?.totalTransactions || 0;
    this.totalSalesAmountFormatted = data?.totalSalesAmountFormatted || '';
  }

  get nameWithCode() {
    return `${this.supplierCode} - ${this.supplierName}`;
  }
}
