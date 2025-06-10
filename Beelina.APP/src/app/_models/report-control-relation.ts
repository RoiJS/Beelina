import { PermissionLevelEnum } from '../_enum/permission-level.enum';
import { ReportControl } from './report-control';

export class ReportControlsRelation {
  reportId: number;
  reportControlId: number;
  order: number;
  defaultValue: string;
  allowAllOption: boolean;
  onlyAvailableOnBusinessModel: string;
  onlyAvailableOnBusinessModelForMinimumPrivilege: PermissionLevelEnum;
  agentTypeOptions: string;
  reportControl: ReportControl;

  constructor() {
    this.reportControl = new ReportControl();
  }
}
