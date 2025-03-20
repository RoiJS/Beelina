export class PurchaseOrderFilter {

  public startDate: string;
  public endDate: string;

  constructor() {
    this.startDate = null;
    this.endDate = null;
  }

  isActive() {
    return !this.startDate || !this.endDate;
  }

  reset() {
    this.startDate = null;
    this.endDate = null;
  }
}
