import { GenderEnum } from '../_enum/gender.enum';

export class User {
  constructor(
    public firstName: string,
    public middleName: string,
    public lastName: string,
    public username: string,
    public gender: GenderEnum,
    public emailAddress: string
  ) {}

  get fullname(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }
}
