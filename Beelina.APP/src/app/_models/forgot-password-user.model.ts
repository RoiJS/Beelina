import { GenderEnum } from '../_enum/gender.enum';
import { User } from './user.model';

export class ForgotPasswordUser extends User {
  constructor(
    public id: number,
    public override firstName: string,
    public override middleName: string,
    public override lastName: string,
    public override username: string,
    public override gender: GenderEnum,
    public override emailAddress: string
  ) {
    super(firstName, middleName, lastName, username, gender, emailAddress);
  }
}
