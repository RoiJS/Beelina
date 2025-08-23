import { Component, OnInit, output, viewChild, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { User } from 'src/app/_models/user.model';

import { AuthService } from 'src/app/_services/auth.service';
import { TransactionSales, TransactionService } from 'src/app/_services/transaction.service';
import { DateFilterEnum, SalesComponent } from 'src/app/sales/sales.component';
import { SalesChartViewComponent } from '../../home/sales-chart-view/sales-chart-view.component';

@Component({
  selector: 'app-sales-information',
  templateUrl: './sales-information.component.html',
  styleUrls: ['./sales-information.component.scss']
})
export class SalesInformationComponent extends SalesComponent implements OnInit {
  private _currentSalesAgent!: User;

  salesChartView = viewChild(SalesChartViewComponent);
  salesChartViewLoadingState = output<boolean>();
  salesChartViewLoading: boolean;

  constructor(
    protected override authService: AuthService,
    protected override formBuilder: FormBuilder,
    protected override transactionService: TransactionService) {
    super(authService, formBuilder, transactionService);

    this._currentLoggedInUser = this.authService.user.value;
    this._currentFilterOption = DateFilterEnum.Weekly;
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
  }

  calculateTotalSales(salesAgent: User) {
    this._currentSalesAgent = salesAgent;
    this.getTransactionSales(this._currentFilterOption);
    this.initChartView();
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
        },
        error: (error) => {
          console.error('SalesInformationComponent: Error fetching transaction sales:', error);
          // Set safe default values to prevent UI issues
          this._sales = 0;
          this._cashOnHand = 0;
          this._chequeOnHand = 0;
          this._badOrders = 0;
          this._accountReceivables = 0;
          this._isLoading = false
        }
      });
  }

  override dateChange(e) {
    this.getTransactionSales(DateFilterEnum.Daily);
    this.initChartView();
  }

  override weekChange(e) {
    this.getTransactionSales(DateFilterEnum.Weekly);
    this.initChartView();
  }

  override monthChange(e) {
    this.getTransactionSales(DateFilterEnum.Monthly);
    this.initChartView();
  }

  override fromDateChange(e) {
    this.validateCustomDateRange();
    this.getTransactionSales(DateFilterEnum.Custom);
    this.initChartView();
  }

  override toDateChange(e) {
    this.validateCustomDateRange();
    this.getTransactionSales(DateFilterEnum.Custom);
    this.initChartView();
  }

  override setFilterOption(filterOption: DateFilterEnum) {
    this._currentFilterOption = filterOption;
    this.initChartView();
    this.getTransactionSales(filterOption);
  }
}
