export class ProductStockPerPanel {
  public productId: number;
  public productName: string;
  public productCode: string;
  public productUnitId: number;
  public productUnitName: string;
  public stockQuantity: number;
  public pricePerUnit: number;
  public price: number;
  public deductedStock: number;
  public withdrawalSlipNo: string;
  public plateNo: string;
  public isTransferable: boolean;
  public numberOfUnits: number;

  constructor() {
    this.productName = '';
    this.productCode = '';
    this.productUnitName = '';
    this.withdrawalSlipNo = '';
    this.plateNo = '';
    this.isTransferable = false;
    this.numberOfUnits = 0;
    this.stockQuantity = 0;
    this.pricePerUnit = 0;
    this.price = 0;
    this.deductedStock = 0;
  }
}
