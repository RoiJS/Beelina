import { IBaseError } from 'src/app/_interfaces/errors/ibase.error';
import { IUserAccountInformationQueryPayload } from 'src/app/_interfaces/payloads/iuser-account-information-query.payload';

export class UserAccountNotExistsError
  implements IUserAccountInformationQueryPayload, IBaseError
{
  public typename: string;
  public code: string;
  public message: string;
}
