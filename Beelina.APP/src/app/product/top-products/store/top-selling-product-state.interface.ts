import { SortOrderOptionsEnum } from "src/app/_enum/sort-order-options.enum";
import { IBaseStateConnection } from "src/app/_interfaces/states/ibase-connection.state";
import { IBaseState } from "src/app/_interfaces/states/ibase.state";
import { TopSellingProduct } from "src/app/_services/transaction.service";

export interface ITopSellingProductsState extends IBaseState, IBaseStateConnection {
  topSellingProducts: Array<TopSellingProduct>;
  totalCount: number;
  fromDate: string;
  toDate: string;
  sortOrder: SortOrderOptionsEnum;
}
