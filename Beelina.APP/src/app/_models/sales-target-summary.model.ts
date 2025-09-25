import { SalesTargetProgress } from "./sales-target-progress.model";

export class SalesTargetSummary {
  public dateFrom: Date;
  public dateTo: Date;
  public salesTargets: SalesTargetProgress[];
  public totalTargetAmount: number;
  public totalCurrentSales: number;
  public totalRemainingSales: number;
  public overallCompletionPercentage: number;
  public totalSalesAgents: number;
  public salesAgentsOnTarget: number;
  public salesAgentsBehindTarget: number;
  public totalStoresWithoutOrders: number;

  constructor() {
    this.dateFrom = new Date();
    this.dateTo = new Date();
    this.salesTargets = [];
    this.totalTargetAmount = 0;
    this.totalCurrentSales = 0;
    this.totalRemainingSales = 0;
    this.overallCompletionPercentage = 0;
    this.totalSalesAgents = 0;
    this.salesAgentsOnTarget = 0;
    this.salesAgentsBehindTarget = 0;
    this.totalStoresWithoutOrders = 0;
  }

  get formattedDateRange(): string {
    const start = this.dateFrom.toLocaleDateString();
    const end = this.dateTo.toLocaleDateString();
    return `${start} - ${end}`;
  }

  get onTargetPercentage(): number {
    return this.totalSalesAgents > 0 ? (this.salesAgentsOnTarget / this.totalSalesAgents) * 100 : 0;
  }

  get behindTargetPercentage(): number {
    return this.totalSalesAgents > 0 ? (this.salesAgentsBehindTarget / this.totalSalesAgents) * 100 : 0;
  }
}
