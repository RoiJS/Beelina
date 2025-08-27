import { Entity } from './entity.model';

import { ReportControlsRelation } from './report-control-relation';
import { ReportCategoryEnum } from '../_enum/report-category.enum';

export class Report extends Entity {
  name: string;
  description: string;
  nameTextIdentifier: string;
  descriptionTextIdentifier: string;
  reportClass: string;
  custom: boolean;
  storedProcedureName: string;
  category: ReportCategoryEnum;
  reportControlsRelations: ReportControlsRelation[];

  constructor() {
    super();

    this.reportControlsRelations = new Array<ReportControlsRelation>();
  }
}
