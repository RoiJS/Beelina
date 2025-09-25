import { IModelNode } from '../_interfaces/imodel-node';
import { Entity } from './entity.model';
import { SalesTargetPeriodType } from '../_enum/sales-target-period-type.enum';
import { User } from './user.model';

export class SalesTarget extends Entity implements IModelNode {
  public salesAgentId: number;
  public targetAmount: number;
  public periodType: SalesTargetPeriodType;
  public startDate: Date;
  public endDate: Date;
  public description: string;
  public salesAgent?: User;

  // Calculated properties
  public currentSales: number;
  public remainingSales: number;
  public completionPercentage: number;
  public daysRemaining: number;
  public targetSalesPerDay: number;
  public storesWithoutOrders: number;
  public targetSalesPerStore: number;

  constructor() {
    super();
    this.id = 0;
    this.salesAgentId = 0;
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
  }

  get periodTypeDisplay(): string {
    switch (this.periodType) {
      case SalesTargetPeriodType.Daily:
        return 'Daily';
      case SalesTargetPeriodType.Weekly:
        return 'Weekly';
      case SalesTargetPeriodType.Monthly:
        return 'Monthly';
      case SalesTargetPeriodType.Quarterly:
        return 'Quarterly';
      case SalesTargetPeriodType.Yearly:
        return 'Yearly';
      case SalesTargetPeriodType.Custom:
        return 'Custom';
      default:
        return 'Unknown';
    }
  }

  get salesAgentName(): string {
    return this.salesAgent ? `${this.salesAgent.firstName} ${this.salesAgent.lastName}` : '';
  }

  get formattedDateRange(): string {
    const start = this.startDate.toLocaleDateString();
    const end = this.endDate.toLocaleDateString();
    return `${start} - ${end}`;
  }

  get isOverdue(): boolean {
    return new Date() > this.endDate && this.completionPercentage < 100;
  }

  get isTargetMet(): boolean {
    return this.completionPercentage >= 100;
  }
}
