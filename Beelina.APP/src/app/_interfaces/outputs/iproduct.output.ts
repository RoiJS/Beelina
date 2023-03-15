import { IBaseError } from '../errors/ibase.error';
import { IProductPayload } from '../payloads/iproduct.payload';

export interface IProductOutput {
  product: IProductPayload;
  errors: Array<IBaseError>;
}
