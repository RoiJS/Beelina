import { ReportControl } from './report-control';

export class ReportControlsRelation {
  reportId: number;
  reportControlId: number;
  order: number;
  defaultValue: string;
  reportControl: ReportControl;

  constructor() {
    this.reportControl = new ReportControl();
  }
}
