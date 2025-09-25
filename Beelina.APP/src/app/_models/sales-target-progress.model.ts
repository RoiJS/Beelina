import { SalesTargetPeriodType } from '../_enum/sales-target-period-type.enum';

export class SalesTargetProgress {
  public id: number;
  public salesAgentId: number;
  public salesAgentName: string;
  public targetAmount: number;
  public periodType: SalesTargetPeriodType;
  public startDate: Date;
  public endDate: Date;
  public description: string;

  // Progress calculations
  public currentSales: number;
  public remainingSales: number;
  public completionPercentage: number;
  public daysRemaining: number;
  public targetSalesPerDay: number;
  public storesWithoutOrders: number;
  public targetSalesPerStore: number;
  public totalStores: number;

  // Additional metrics
  public isOverdue: boolean;
  public isTargetMet: boolean;
  public dailyAverageSales: number;
  public daysElapsed: number;
  public totalDays: number;

  constructor() {
    this.id = 0;
    this.salesAgentId = 0;
    this.salesAgentName = '';
    this.targetAmount = 0;
    this.periodType = SalesTargetPeriodType.Monthly;
    this.startDate = new Date();
    this.endDate = new Date();
    this.description = '';
    this.currentSales = 0;
    this.remainingSales = 0;
    this.completionPercentage = 0;
    this.daysRemaining = 0;
    this.targetSalesPerDay = 0;
    this.storesWithoutOrders = 0;
    this.targetSalesPerStore = 0;
    this.totalStores = 0;
    this.isOverdue = false;
    this.isTargetMet = false;
    this.dailyAverageSales = 0;
    this.daysElapsed = 0;
    this.totalDays = 0;
  }

  get formattedDateRange(): string {
    const start = this.startDate.toLocaleDateString();
    const end = this.endDate.toLocaleDateString();
    return `${start} - ${end}`;
  }

  get progressStatus(): 'on-track' | 'behind' | 'completed' | 'overdue' {
    if (this.isTargetMet) return 'completed';
    if (this.isOverdue) return 'overdue';
    if (this.completionPercentage >= 80) return 'on-track';
    return 'behind';
  }

  get progressStatusColor(): string {
    switch (this.progressStatus) {
      case 'completed':
        return '#4CAF50'; // Green
      case 'on-track':
        return '#2196F3'; // Blue
      case 'behind':
        return '#FF9800'; // Orange
      case 'overdue':
        return '#F44336'; // Red
      default:
        return '#9E9E9E'; // Gray
    }
  }

  get storesWithoutOrdersPercentage(): number {
    return this.totalStores > 0 ? (this.storesWithoutOrders / this.totalStores) * 100 : 0;
  }
}
