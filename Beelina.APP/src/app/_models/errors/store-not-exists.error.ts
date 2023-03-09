import { IBaseError } from 'src/app/_interfaces/errors/ibase.error';
import { IStoreInformationQueryPayload } from 'src/app/_interfaces/payloads/istore-information-query.payload';

export class StoreNotExistsError
  implements IStoreInformationQueryPayload, IBaseError
{
  public typename: string;
  public code: string;
  public message: string;
}
