import { ProductWarehouseStockReceiptEntry } from '../product-warehouse-stock-receipt-entry';
import { IProductWarehouseStockReceiptEntryPayload } from 'src/app/_interfaces/payloads/iproduct-warehouse-stock-receipt-entry-query.payload';
import { IModelNode } from 'src/app/_interfaces/imodel-node';
import { ProductStockWarehouseAuditsResult } from './product-stock-warehouse-audit-result';

export class ProductWarehouseStockReceiptEntryResult extends ProductWarehouseStockReceiptEntry implements IProductWarehouseStockReceiptEntryPayload, IModelNode {
  public typename: string;
  public productStockWarehouseAuditsResult: Array<ProductStockWarehouseAuditsResult>;

  constructor() {
    super();
    this.productStockWarehouseAuditsResult = [];
  }
}
