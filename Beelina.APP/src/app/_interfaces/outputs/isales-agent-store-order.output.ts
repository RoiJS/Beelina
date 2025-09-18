import { IStoreOrder } from './istore-order.output';

export interface ISalesAgentStoreOrder {
  salesAgentId: number;
  storeOrders: IStoreOrder[];
}
