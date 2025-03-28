import { IBaseError } from '../errors/ibase.error';
import { IWithdrawalEntryPayload } from '../payloads/iwithdrawal-entry.payload';

export interface IWithdrawalEntryOutput {
  productWithdrawalEntry: IWithdrawalEntryPayload;
  errors: Array<IBaseError>;
}
