import { IReportInformationQueryPayload } from 'src/app/_interfaces/payloads/ireport-information-query.payload';

export class ReportNotificationEmailAddressResult implements IReportInformationQueryPayload {
  public typename: string;
  public emailAddress: string;
}
