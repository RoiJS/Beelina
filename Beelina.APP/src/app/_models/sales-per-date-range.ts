import { DateRange } from "./date-range";

export class SalesPerDateRange extends DateRange {
  public totalSales: number;
  public cashAmountOnHand: number;
  public chequeAmountOnHand: number;
  public totalAmountOnHand: number;
  public badOrderAmount: number;
  public accountReceivables: number;
}
