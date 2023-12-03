import { IBaseStateConnection } from 'src/app/_interfaces/states/ibase-connection.state';
import { IBaseState } from 'src/app/_interfaces/states/ibase.state';

import { ProductStockAudit } from 'src/app/_models/product-stock-audit';

export interface IProductStockAuditState extends IBaseState, IBaseStateConnection {
  productStockAudits: Array<ProductStockAudit>;
}
