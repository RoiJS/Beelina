import { IBaseError } from '../errors/ibase.error';
import { IProductPayload } from '../payloads/iproduct.payload';

export interface IProductOutput {
  products: Array<IProductPayload> | IProductPayload;
  errors: Array<IBaseError>;
}
