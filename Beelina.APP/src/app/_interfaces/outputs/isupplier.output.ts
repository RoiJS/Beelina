import { IBaseError } from '../errors/ibase.error';
import { ISupplierPayload } from '../payloads/isupplier.payload';

export interface ISupplierOutput {
  supplier: ISupplierPayload;
  boolean: boolean;
  errors: Array<IBaseError>;
}
