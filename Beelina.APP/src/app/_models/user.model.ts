import { GenderEnum } from '../_enum/gender.enum';
import { UserCredentials } from './user-credentials';

export class User {
  public id: number;
  public firstName: string;
  public middleName: string;
  public lastName: string;
  public username: string;
  public password: string;
  public gender: GenderEnum;
  public emailAddress: string;
  public credentials: UserCredentials;

  constructor() {
    this.credentials = new UserCredentials();
  }

  get fullname(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }
}
