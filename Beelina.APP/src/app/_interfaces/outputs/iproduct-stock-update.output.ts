import { IBaseError } from '../errors/ibase.error';
import { IProductPayload } from '../payloads/iproduct.payload';

export interface IProductStockAuditOutput {
  productStockAudit: IProductPayload;
  errors: Array<IBaseError>;
}
