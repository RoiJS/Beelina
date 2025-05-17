import { Component, OnInit, output, viewChild, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
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
  private _currentSalesAgent: User;

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
    return this.getDateRanges(this._currentFilterOption, 5);
  }

  initChartView() {
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
    const userId = this._currentSalesAgent.id;
    const dateFilters = this.getDateRange(filterOption);
    this._isLoading = true;
    this.transactionService
      .getTransactionSales(userId, dateFilters.fromDate, dateFilters.toDate)
      .subscribe((transactionSales: TransactionSales) => {
        this._isLoading = false;
        this._sales = transactionSales.totalSalesAmount;
        this._cashOnHand = transactionSales.cashAmountOnHand;
        this._chequeOnHand = transactionSales.chequeAmountOnHand;
        this._badOrders = transactionSales.badOrderAmount;
        this._accountReceivables = transactionSales.accountReceivables;
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

  override setFilterOption(filterOption: DateFilterEnum) {
    this._currentFilterOption = filterOption;
    this.initChartView();
    this.getTransactionSales(filterOption);
  }
}
