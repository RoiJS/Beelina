import { IModelNode } from '../_interfaces/imodel-node';
import { Entity } from './entity.model';
import { ProductStockAudit } from './product-stock-audit';
import { User } from './user.model';
import { NumberFormatter } from '../_helpers/formatters/number-formatter.helper';

export class ProductWithdrawalEntry extends Entity implements IModelNode {
  public userAccountId: number;
  public userAccount: User;
  public stockEntryDate: Date;
  public withdrawalSlipNo: string;
  public notes: string;
  public productStockAudits: Array<ProductStockAudit>;
  public totalAmount: number;

  get formattedTotalAmount(): string {
    return NumberFormatter.formatCurrency(this.totalAmount || 0);
  }

  constructor() {
    super();
    this.userAccount = new User();
    this.productStockAudits = [];
    this.totalAmount = 0;
  }
}
