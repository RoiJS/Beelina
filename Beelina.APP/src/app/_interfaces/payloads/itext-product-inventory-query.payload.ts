import { ProductUnit } from 'src/app/_models/product-unit';
import { IQueryPayload } from './iquery.payload';

export interface ITextProductInventoryQueryPayload extends IQueryPayload {
  id: number;
  name: string;
  code: string;
  description: string;
  additionalQuantity: number;
  price: number;
  isTransferable: boolean;
  numberOfUnits: number;
  withdrawalSlipNo: string;
  productUnit: ProductUnit;
}
