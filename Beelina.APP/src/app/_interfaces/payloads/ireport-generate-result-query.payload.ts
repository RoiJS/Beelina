import { GenerateReportOptionEnum } from 'src/app/_enum/generate-report-option.enum';
import { IQueryPayload } from './iquery.payload';

export interface IGenerateReportResultQueryPayload extends IQueryPayload {
  generateReportOption: GenerateReportOptionEnum;
  reportData: IReportDataResult;
}

interface IReportDataResult {
  fileName: string;
  base64String: string;
  contentType: string;
}
