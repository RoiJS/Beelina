import { IBaseStateConnection } from 'src/app/_interfaces/states/ibase-connection.state';
import { IBaseState } from 'src/app/_interfaces/states/ibase.state';
import { User } from 'src/app/_models/user.model';

export interface IUserAccountState extends IBaseState, IBaseStateConnection {
  userAccounts: Array<User>;
  totalCount: number;
}
