import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AuthService } from 'src/app/_services/auth.service';
import { TransactionService } from 'src/app/_services/transaction.service';
import { DateFilterEnum, SalesComponent } from 'src/app/sales/sales.component';
import { SalesChartViewComponent } from './sales-chart-view/sales-chart-view.component';
import { TransactionSalesPerSalesAgent } from 'src/app/_models/sales-per-agent';
import { SalesPerAgentViewComponent } from './sales-per-agent-view/sales-per-agent-view.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent extends SalesComponent implements OnInit, AfterViewInit {
  @ViewChild(SalesChartViewComponent) salesChartView: SalesChartViewComponent;
  @ViewChild(SalesPerAgentViewComponent) salesPerAgentChartView: SalesPerAgentViewComponent;

  salesChartViewLoading: boolean;
  salesPerAgentChartViewLoading: boolean;

  private userId: number;

  constructor(
    protected override authService: AuthService,
    protected override formBuilder: FormBuilder,
    protected override transactionService: TransactionService) {
    super(authService, formBuilder, transactionService);
    this._currentFilterOption = DateFilterEnum.Monthly;

    this.userId = this.authService.user.value.id;
  }

  override ngOnInit() {
    super.ngOnInit();
  }

  dateRanges() {
    return this.getDateRanges(this._currentFilterOption, 8);
  }

  initChartView() {
    this.salesChartViewLoading = true;
    this.salesChartView.loadTotalSalesChart(this.userId, this.dateRanges(), () => {
      this.salesChartViewLoading = false;
    });
    setTimeout(() => {
      this.salesPerAgentChartViewLoading = true;
      this.salesPerAgentChartView.loadTotalSalesChart(this.getDateRange(this._currentFilterOption), () => {
        this.salesPerAgentChartViewLoading = false;
      })
    }, 500);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initChartView();
    }, 0);
  }

  override setFilterOption(filterOption: DateFilterEnum) {
    this._currentFilterOption = filterOption;
    this.getTransactionSales(filterOption);
    this.initChartView();
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
}
