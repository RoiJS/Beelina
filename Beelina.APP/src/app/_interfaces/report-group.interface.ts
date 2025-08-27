import { Report } from '../_models/report';
import { ReportCategoryEnum } from '../_enum/report-category.enum';

export interface ReportGroup {
  category: ReportCategoryEnum;
  categoryLabelKey: string; // i18n translation key for category name
  reports: Report[];
  isCollapsed: boolean;
}
