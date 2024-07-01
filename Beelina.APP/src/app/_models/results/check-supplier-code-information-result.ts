import { ISupplierInformationQueryPayload } from 'src/app/_interfaces/payloads/isupplier-information-query.payload';

export class CheckSupplierCodeInformationResult
  implements ISupplierInformationQueryPayload
{
  public typename: string;
  public exists: boolean;
}
