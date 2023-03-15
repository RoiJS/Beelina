import { IBaseError } from '../errors/ibase.error';
import { ITransactionPayload } from '../payloads/itransaction.payload';

export interface ITransactionOutput {
  transaction: ITransactionPayload;
  errors: Array<IBaseError>;
}
