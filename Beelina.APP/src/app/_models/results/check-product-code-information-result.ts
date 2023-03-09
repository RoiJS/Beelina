import { IProductInformationQueryPayload } from 'src/app/_interfaces/payloads/iproduct-information-query.payload';

export class CheckProductCodeInformationResult
  implements IProductInformationQueryPayload
{
  public typename: string;
  public exists: boolean;
}
