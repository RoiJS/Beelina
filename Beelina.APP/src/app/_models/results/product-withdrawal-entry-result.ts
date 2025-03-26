import { IModelNode } from 'src/app/_interfaces/imodel-node';
import { ProductWithdrawalEntry } from '../product-withdrawal-entry';
import { IProductWithdrawalEntryPayload } from 'src/app/_interfaces/payloads/iproduct-withdrawal-entry-query.payload';
import { ProductStockAuditsResult } from './product-stock-audit-result';

export class ProductWithdrawalEntryResult extends ProductWithdrawalEntry implements IProductWithdrawalEntryPayload, IModelNode {
  public typename: string;
  public productWithdrawalAuditsResult: Array<ProductStockAuditsResult>;

  constructor() {
    super();
    this.productWithdrawalAuditsResult = [];
  }
}
