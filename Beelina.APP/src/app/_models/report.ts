import { Entity } from './entity.model';

import { ReportControlsRelation } from './report-control-relation';

export class Report extends Entity {
  name: string;
  description: string;
  nameTextIdentifier: string;
  descriptionTextIdentifier: string;
  reportClass: string;
  custom: boolean;
  storedProcedureName: string;
  reportControlsRelations: ReportControlsRelation[];

  constructor() {
    super();

    this.reportControlsRelations = new Array<ReportControlsRelation>();
  }
}
