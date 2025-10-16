import { DateFormatter } from "src/app/_helpers/formatters/date-formatter.helper";

export class PurchaseOrderFilter {

  public startDate: string;
  public endDate: string;
  public supplierId: number;

  constructor() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    this.startDate = DateFormatter.format(firstDayOfMonth);
    this.endDate = DateFormatter.format(lastDayOfMonth);
    this.supplierId = 0; // 0 means "All suppliers"
  }

  isActive() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return this.startDate !== DateFormatter.format(firstDayOfMonth) ||
           this.endDate !== DateFormatter.format(lastDayOfMonth) ||
           this.supplierId !== 0;
  }

  reset() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    this.startDate = DateFormatter.format(firstDayOfMonth);
    this.endDate = DateFormatter.format(lastDayOfMonth);
    this.supplierId = 0; // Reset to "All suppliers"
  }
}
