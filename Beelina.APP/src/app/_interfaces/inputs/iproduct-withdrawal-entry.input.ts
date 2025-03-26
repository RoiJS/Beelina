import { IProductStockAuditInput } from './iproduct-stock-audit.input';

export interface IProductWithdrawalEntryInput {
  id: number;
  userAccountId: number;
  stockEntryDate: Date;
  withdrawalSlipNo: string;
  notes: string;
  productStockAuditsInputs: Array<IProductStockAuditInput>;
}
