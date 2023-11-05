import { IBaseError } from 'src/app/_interfaces/errors/ibase.error';
import { IReportInformationQueryPayload } from 'src/app/_interfaces/payloads/ireport-information-query.payload';

export class ReportNotExistsError
  implements IReportInformationQueryPayload, IBaseError
{
  public typename: string;
  public code: string;
  public message: string;
}
