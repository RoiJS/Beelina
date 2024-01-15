import { SortOrderOptionsEnum } from 'src/app/_enum/sort-order-options.enum';
import { StockAuditSourceEnum } from 'src/app/_enum/stock-audit-source.enum';
import { IBaseStateConnection } from 'src/app/_interfaces/states/ibase-connection.state';
import { IBaseState } from 'src/app/_interfaces/states/ibase.state';
import { ProductStockAuditItem } from 'src/app/_models/product-stock-audit-item';


export interface IProductStockAuditState extends IBaseState, IBaseStateConnection {
  productStockAuditItems: Array<ProductStockAuditItem>;
  fromDate: string;
  toDate: string;
  sortOrder: SortOrderOptionsEnum;
  stockAuditSource: StockAuditSourceEnum;
}
