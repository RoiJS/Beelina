import { IProductWithdrawalEntryPayload } from 'src/app/_interfaces/payloads/iproduct-withdrawal-entry-query.payload';

export class CheckProductWithdrawalCodeInformationResult
  implements IProductWithdrawalEntryPayload {
  public typename: string;
  public exists: boolean;
}
