import { NumberFormatter } from "../_helpers/formatters/number-formatter.helper";

export class TransactionSalesPerSalesAgent {
  public id: number;
  public salesAgentName: string;
  public sales: number;

  get salesFormatted(): string {
    return NumberFormatter.formatCurrency(this.sales);
  }
}
