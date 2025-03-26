import { IModelNode } from '../_interfaces/imodel-node';
import { Entity } from './entity.model';
import { ProductStockAudit } from './product-stock-audit';
import { User } from './user.model';

export class ProductWithdrawalEntry extends Entity implements IModelNode {
  public userAccountId: number;
  public userAccount: User;
  public stockEntryDate: Date;
  public withdrawalSlipNo: string;
  public notes: string;
  public productStockAudits: Array<ProductStockAudit>;

  constructor() {
    super();
    this.userAccount = new User();
    this.productStockAudits = [];
  }
}
