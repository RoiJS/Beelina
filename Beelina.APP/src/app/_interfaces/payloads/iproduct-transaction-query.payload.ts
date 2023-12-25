import { IQueryPayload } from './iquery.payload';

export interface IProductTransactionQueryPayload extends IQueryPayload {
  id: number;
  code: string;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  currentQuantity: number;
}
