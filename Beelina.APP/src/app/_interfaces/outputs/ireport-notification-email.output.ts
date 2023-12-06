import { IBaseError } from '../errors/ibase.error';

export interface IReportNotificationEmailOutput {
  reportNotificationEmailAddress: string;
  errors: Array<IBaseError>;
}
