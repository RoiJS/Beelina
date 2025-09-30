import { Component, inject, OnInit, output, viewChild, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { SalesTargetProgress } from 'src/app/_models/sales-target-progress.model';
import { User } from 'src/app/_models/user.model';

import { DateFilterEnum } from 'src/app/_enum/date-filter.enum';
import { AuthService } from 'src/app/_services/auth.service';
import { TransactionSales, TransactionService } from 'src/app/_services/transaction.service';
import { SalesTargetStore } from 'src/app/_stores/sales-target.store';
import { SalesComponent } from 'src/app/sales/sales.component';
import { SalesChartViewComponent } from '../../home/sales-chart-view/sales-chart-view.component';
import { SalesBreakdownData, SalesBreakdownDialogComponent } from './sales-breakdown-dialog/sales-breakdown-dialog.component';
import { SalesTargetDetailsData, SalesTargetDetailsDialogComponent } from './sales-target-details-dialog/sales-target-details-dialog.component';
import { NumberFormatter } from 'src/app/_helpers/formatters/number-formatter.helper';

@Component({
  selector: 'app-sales-information',
  templateUrl: './sales-information.component.html',
  styleUrls: ['./sales-information.component.scss']
})
export class SalesInformationComponent extends SalesComponent implements OnInit {
  private _currentSalesAgent!: User;
  private _salesTargetStore = inject(SalesTargetStore);

  salesChartView = viewChild(SalesChartViewComponent);
  salesChartViewLoadingState = output<boolean>();
  dateFilterChange = output<{ fromDate: string; toDate: string; dateFilter: DateFilterEnum }>();
  salesChartViewLoading: boolean;

  // Computed properties for sales target progress
  get salesTargetProgress(): SalesTargetProgress[] {
    return this._salesTargetStore.salesTargetProgress();
  }

  get currentSalesTargetProgress(): SalesTargetProgress | null {
    if (!this._currentSalesAgent?.id) return null;
    return this.salesTargetProgress.find(progress => progress.salesAgentId === this._currentSalesAgent.id) || null;
  }

  constructor(
    protected override authService: AuthService,
    protected override formBuilder: FormBuilder,
    protected override transactionService: TransactionService,
    private dialog: MatDialog) {
    super(authService, formBuilder, transactionService);

    this._currentLoggedInUser = this.authService.user.value;
    this._currentFilterOption = DateFilterEnum.Monthly;
  }

  override ngOnInit() {
  }

  dateRanges() {
    return this.getDateRanges(this._currentFilterOption, 7);
  }

  initChartView() {
    // Defensive guard: ensure _currentSalesAgent is set before proceeding
    if (!this._currentSalesAgent?.id) {
      console.warn('SalesInformationComponent: Cannot initialize chart view - sales agent not set');
      this.salesChartViewLoadingState.emit(false);
      return;
    }

    this.salesChartViewLoadingState.emit(true);
    this.salesChartView().loadTotalSalesChart(this._currentSalesAgent.id, this.dateRanges(), () => {
      this.salesChartViewLoadingState.emit(false);
    });

    const dateFilters = this.getDateRange(this._currentFilterOption);
    this.dateFilterChange.emit(dateFilters);
  }

  calculateTotalSales(salesAgent: User) {
    this._currentSalesAgent = salesAgent;
    this.getTransactionSales(this._currentFilterOption);
    this.initChartView();
    this.loadSalesTargetProgress();
  }

  private loadSalesTargetProgress() {
    if (!this._currentSalesAgent?.id) return;

    // Set the date range in the sales target store to match current filter
    const dateRange = this.getDateRanges(this._currentFilterOption, 1);
    if (dateRange.length > 0) {
      const fromDate = new Date(dateRange[0].fromDate);
      const toDate = new Date(dateRange[0].toDate);
      this._salesTargetStore.setSelectedDateRange(fromDate, toDate);
    }

    // Load sales target progress for the current agent
    this._salesTargetStore.getSalesTargetProgress([this._currentSalesAgent.id]);
  }

  override getTransactionSales(filterOption: DateFilterEnum) {
    // Defensive guard: ensure _currentSalesAgent is set before proceeding
    if (!this._currentSalesAgent?.id) {
      console.warn('SalesInformationComponent: Cannot get transaction sales - sales agent not set');
      this._isLoading = false;
      return;
    }

    const userId = this._currentSalesAgent.id;
    const dateFilters = this.getDateRange(filterOption);
    this._isLoading = true;
    this.transactionService
      .getTransactionSales(userId, dateFilters.fromDate, dateFilters.toDate)
      .subscribe({
        next: (transactionSales: TransactionSales) => {
          this._sales = transactionSales.totalSalesAmount;
          this._cashOnHand = transactionSales.cashAmountOnHand;
          this._chequeOnHand = transactionSales.chequeAmountOnHand;
          this._badOrders = transactionSales.badOrderAmount;
          this._accountReceivables = transactionSales.accountReceivables;
          this._isLoading = false

          this.dateFilterChange.emit(dateFilters);
        },
        error: (error) => {
          console.error('SalesInformationComponent: Error fetching transaction sales:', error);
          // Set safe default values to prevent UI issues
          this._sales = 0;
          this._cashOnHand = 0;
          this._chequeOnHand = 0;
          this._badOrders = 0;
          this._accountReceivables = 0;
          this._isLoading = false;
        }
      });
  }

  override dateChange(e) {
    this.getTransactionSales(DateFilterEnum.Daily);
    this.initChartView();
    this.loadSalesTargetProgress();
  }

  override weekChange(e) {
    this.getTransactionSales(DateFilterEnum.Weekly);
    this.initChartView();
    this.loadSalesTargetProgress();
  }

  override monthChange(e) {
    this.getTransactionSales(DateFilterEnum.Monthly);
    this.initChartView();
    this.loadSalesTargetProgress();
  }

  override fromDateChange(e) {
    this.validateCustomDateRange();
    this.getTransactionSales(DateFilterEnum.Custom);
    this.initChartView();
    this.loadSalesTargetProgress();
  }

  override toDateChange(e) {
    this.validateCustomDateRange();
    this.getTransactionSales(DateFilterEnum.Custom);
    this.initChartView();
    this.loadSalesTargetProgress();
  }

  override setFilterOption(filterOption: DateFilterEnum) {
    this._currentFilterOption = filterOption;
    this.initChartView();
    this.getTransactionSales(filterOption);
    this.loadSalesTargetProgress();
  }

  // Helper methods for sales target display
  getFormattedTargetAmount(): string {
    const progress = this.currentSalesTargetProgress;
    if (!progress) return 'No target set';
    return `₱${progress.targetAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  getFormattedCurrentSales(): string {
    const progress = this.currentSalesTargetProgress;
    if (!progress) return '₱0.00';
    return `₱${progress.currentSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  getCompletionPercentage(): number {
    const progress = this.currentSalesTargetProgress;
    return progress ? NumberFormatter.roundToDecimalPlaces(progress.completionPercentage, 2) : 0;
  }

  getFormattedRemainingSales(): string {
    const progress = this.currentSalesTargetProgress;
    if (!progress) return '₱0.00';
    const remainingSales = Math.max(0, progress.remainingSales);
    return `₱${remainingSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  getDaysRemaining(): number {
    const progress = this.currentSalesTargetProgress;
    return progress ? progress.daysRemaining : 0;
  }

  getTargetSalesPerDay(): string {
    const progress = this.currentSalesTargetProgress;
    if (!progress) return '₱0.00';
    return `₱${progress.targetSalesPerDay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  isTargetMet(): boolean {
    const progress = this.currentSalesTargetProgress;
    return progress ? progress.isTargetMet : false;
  }

  isTargetOverdue(): boolean {
    const progress = this.currentSalesTargetProgress;
    return progress ? progress.isOverdue : false;
  }

  get targetPeriodDisplay(): string {
    const progress = this.currentSalesTargetProgress;
    if (!progress) return '';
    const startDate = new Date(progress.startDate).toLocaleDateString();
    const endDate = new Date(progress.endDate).toLocaleDateString();
    return `${startDate} - ${endDate}`;
  }

  openSalesBreakdownDialog(): void {
    if (!this._currentSalesAgent) return;

    const data: SalesBreakdownData = {
      salesAgentName: `${this._currentSalesAgent.firstName} ${this._currentSalesAgent.lastName}`,
      totalSalesAmount: this._sales,
      netSalesAmount: this._sales - this._badOrders,
      taxAmount: 0, // Tax amount is not available in the current data structure
      discountAmount: this._badOrders,
      cashOnHand: this._cashOnHand,
      chequeOnHand: this._chequeOnHand,
      accountReceivables: this._accountReceivables,
      badOrders: this._badOrders
    };

    this.dialog.open(SalesBreakdownDialogComponent, {
      width: '550px',
      data: data,
      panelClass: 'custom-dialog-container'
    });
  }

  openTargetDetailsDialog(): void {
    const progress = this.currentSalesTargetProgress;
    if (!progress || !this._currentSalesAgent) return;

    const data: SalesTargetDetailsData = {
      salesAgentName: `${this._currentSalesAgent.firstName} ${this._currentSalesAgent.lastName}`,
      targetAmount: progress.targetAmount,
      achievedAmount: progress.currentSales,
      remainingAmount: progress.remainingSales,
      progressPercentage: NumberFormatter.roundToDecimalPlaces(progress.completionPercentage, 2),
      startDate: new Date(progress.startDate).toLocaleDateString(),
      endDate: new Date(progress.endDate).toLocaleDateString(),
      daysLeft: progress.daysRemaining,
      isTargetMet: progress.isTargetMet,
      isTargetOverdue: progress.isOverdue,
      targetSalesPerDay: progress.targetSalesPerDay,
      targetSalesPerStore: progress.targetSalesPerStore,
      totalStores: progress.totalStores,
      storesWithoutOrders: progress.storesWithoutOrders
    };

    this.dialog.open(SalesTargetDetailsDialogComponent, {
      width: '550px',
      data: data,
      panelClass: 'custom-dialog-container'
    });
  }
}
