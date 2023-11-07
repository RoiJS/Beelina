import { IUserAccountInformationQueryPayload } from 'src/app/_interfaces/payloads/iuser-account-information-query.payload';

export class CheckUsernameInformationResult
  implements IUserAccountInformationQueryPayload
{
  public typename: string;
  public exists: boolean;
}
