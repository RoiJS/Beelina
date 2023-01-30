import { IBaseError } from 'src/app/_interfaces/errors/ibase.error';
import { IClientInformationQueryPayload } from 'src/app/_interfaces/payloads/iclient-information-query.payload';

export class ClientNotExistsError
  implements IClientInformationQueryPayload, IBaseError
{
  public typename: string;
  public code: string;
  public message: string;
}
