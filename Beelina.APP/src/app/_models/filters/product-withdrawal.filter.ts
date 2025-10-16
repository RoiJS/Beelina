import { DateFormatter } from "src/app/_helpers/formatters/date-formatter.helper";

export class ProductWithdrawalFilter {

  public endDate: string;
  public startDate: string;
  public salesAgentId: number;

  constructor() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    this.startDate = DateFormatter.format(firstDayOfMonth);
    this.endDate = DateFormatter.format(lastDayOfMonth);
    this.salesAgentId = 0; // 0 means "All Sales Agents"
  }

  isActive() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return this.startDate !== DateFormatter.format(firstDayOfMonth) ||
           this.endDate !== DateFormatter.format(lastDayOfMonth) ||
           this.salesAgentId !== 0;
  }

  reset() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    this.startDate = DateFormatter.format(firstDayOfMonth);
    this.endDate = DateFormatter.format(lastDayOfMonth);
    this.salesAgentId = 0;
  }
}
