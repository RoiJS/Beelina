import { IReportInformationQueryPayload } from 'src/app/_interfaces/payloads/ireport-information-query.payload';
import { ReportControlsRelation } from '../report-control-relation';

export class ReportInformationResult implements IReportInformationQueryPayload {
  public typename: string;
  public id: number;
  public nameTextIdentifier: string;
  public descriptionTextIdentifier: string;
  public reportClass: string;
  public custom: boolean;
  public storedProcedureName: string;
  public reportControlsRelations: ReportControlsRelation[];
}
