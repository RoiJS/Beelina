import { IQueryPayload } from './iquery.payload';

export interface IValidateProductQuantitiesQueryPayload extends IQueryPayload {
  productId: number;
  productName: string;
  productCode: string;
  currentQuantity: number;
  selectedQuantity: number;
}
