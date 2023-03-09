import { IBaseError } from 'src/app/_interfaces/errors/ibase.error';
import { IProductInformationQueryPayload } from 'src/app/_interfaces/payloads/iproduct-information-query.payload';

export class ProductNotExistsError
  implements IProductInformationQueryPayload, IBaseError
{
  public typename: string;
  public code: string;
  public message: string;
}
