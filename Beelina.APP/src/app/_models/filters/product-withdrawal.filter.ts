import { DateFormatter } from "src/app/_helpers/formatters/date-formatter.helper";

export class ProductWithdrawalFilter {

  public startDate: string;
  public endDate: string;

  constructor() {
    this.startDate = null;
    this.endDate = null;
  }

  isActive() {
    return DateFormatter.isValidDate(this.startDate) || DateFormatter.isValidDate(this.endDate);
  }

  reset() {
    this.startDate = null;
    this.endDate = null;
  }
}
