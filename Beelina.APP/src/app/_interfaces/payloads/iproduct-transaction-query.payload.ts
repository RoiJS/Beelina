import { IQueryPayload } from './iquery.payload';

export interface IProductTransactionQueryPayload extends IQueryPayload {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  currentQuantity: number;
}
