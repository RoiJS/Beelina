import { IBaseError } from '../errors/ibase.error';
import { IProductStockPerPanelPayload } from '../payloads/iproduct-stock-per-panel.payload';

export interface IProductStockPerPanelOutput {
  productStockPerPanel: Array<IProductStockPerPanelPayload>;
  errors: Array<IBaseError>;
}
