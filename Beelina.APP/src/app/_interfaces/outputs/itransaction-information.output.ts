import { IBaseError } from '../errors/ibase.error';
import { ITransactionPayload } from '../payloads/itransaction.payload';

export interface ITransactionInformationOutput {
  transactionInformation: ITransactionPayload;
  errors: Array<IBaseError>;
}
