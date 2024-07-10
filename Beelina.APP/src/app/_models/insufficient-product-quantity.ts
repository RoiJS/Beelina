export class InsufficientProductQuantity {
  public productId: number;
  public productName: string;
  public productCode: string;
  public currentQuantity: number;
  public selectedQuantity: number;

  constructor() { }
}

export class ProductTransactionOverallQuantities {
  public productId: number;
  public productCode: string;
  public productName: string;
  public currentQuantity: number;
  public overallQuantity: number;
  public productTransactionOverallQuantitiesTransactions: Array<ProductTransactionOverallQuantitiesTransactions>;
  constructor() {
    this.productTransactionOverallQuantitiesTransactions = [];
  }
}

export class ProductTransactionOverallQuantitiesTransactions {
  public transactionId: number;
  public transationCode: string;
}
