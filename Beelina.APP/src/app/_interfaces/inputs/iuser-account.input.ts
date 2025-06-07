import { GenderEnum } from 'src/app/_enum/gender.enum';
import { IUserPermissionInput } from './iuser-permission.input';
import { SalesAgentTypeEnum } from 'src/app/_enum/sales-agent-type.enum';

export interface IUserAccountInput {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: GenderEnum;
  emailAddress: string;
  username: string;
  newPassword: string;
  salesAgentType: SalesAgentTypeEnum;
  userPermissions: IUserPermissionInput[];
}
