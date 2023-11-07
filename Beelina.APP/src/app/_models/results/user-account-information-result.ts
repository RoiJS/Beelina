import { IUserAccountInformationQueryPayload } from 'src/app/_interfaces/payloads/iuser-account-information-query.payload';
import { User } from '../user.model';

export class UserAccountInformationResult
  extends User
  implements IUserAccountInformationQueryPayload
{
  public typename: string;
}
