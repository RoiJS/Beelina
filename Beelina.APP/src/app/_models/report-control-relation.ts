import { BusinessModelEnum } from '../_enum/business-model.enum';
import { PermissionLevelEnum } from '../_enum/permission-level.enum';
import { ReportControl } from './report-control';

export class ReportControlsRelation {
  reportId: number;
  reportControlId: number;
  order: number;
  defaultValue: string;
  allowAllOption: boolean;
  onlyAvailableOnBusinessModel: BusinessModelEnum;
  onlyAvailableOnBusinessModelForMinimumPrivilege: PermissionLevelEnum;

  reportControl: ReportControl;

  constructor() {
    this.reportControl = new ReportControl();
  }
}
