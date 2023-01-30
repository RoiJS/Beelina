import { User } from 'src/app/_models/user.model';

export interface IAuthResponseOutput {
  accessToken: string;
  refreshToken: string;
  currentUser: User;
  expiresIn: Date;
}
