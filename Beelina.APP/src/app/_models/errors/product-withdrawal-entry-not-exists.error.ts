import { IBaseError } from 'src/app/_interfaces/errors/ibase.error';
import { IProductWithdrawalEntryPayload } from 'src/app/_interfaces/payloads/iproduct-withdrawal-entry-query.payload';

export class ProductWithdrawalEntryNotExistsError
  implements IProductWithdrawalEntryPayload, IBaseError {
  public typename: string;
  public code: string;
  public message: string;
}
