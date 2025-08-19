import { AfterViewInit, Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { AuthService } from 'src/app/_services/auth.service';
import { TransactionService } from 'src/app/_services/transaction.service';
import { DateFilterEnum, SalesComponent } from 'src/app/sales/sales.component';
import { SalesChartViewComponent } from './sales-chart-view/sales-chart-view.component';
import { SalesPerAgentViewComponent } from './sales-per-agent-view/sales-per-agent-view.component';
import { LocalClientSubscriptionDbService } from 'src/app/_services/local-db/local-client-subscription-db.service';
import { ClientSubscriptionDetails } from 'src/app/_models/client-subscription-details.model';
import { SubscriptionFeatureHideDashboardWidget } from 'src/app/_models/subscription-feature-hide-dashboard-widget.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent extends SalesComponent implements OnInit, AfterViewInit {
  private userId: number;

  salesChartView = viewChild(SalesChartViewComponent);
  salesPerAgentChartView = viewChild(SalesPerAgentViewComponent);
  clientSubscriptionDetails: ClientSubscriptionDetails;
  salesChartViewLoading: boolean;
  salesPerAgentChartViewLoading: boolean;

  localClientSubscriptionDbService = inject(LocalClientSubscriptionDbService);

  DASHBOARD_WIDGET_ID = 1;
  hideSalesAgentDistributionWidget = signal<boolean>(false);

  constructor(
    protected override authService: AuthService,
    protected override formBuilder: FormBuilder,
    protected override transactionService: TransactionService) {
    super(authService, formBuilder, transactionService);
    this._currentFilterOption = DateFilterEnum.Monthly;

    this.userId = this.authService.user.value.id;
  }

  override async ngOnInit() {
    super.ngOnInit();

    this.clientSubscriptionDetails = await this.localClientSubscriptionDbService.getLocalClientSubsription();
    const result = this.clientSubscriptionDetails?.subscriptionFeatureHideDashboardWidgets.findIndex((x: SubscriptionFeatureHideDashboardWidget) => x.dashboardModuleWidgetId === this.DASHBOARD_WIDGET_ID) > -1;
    this.hideSalesAgentDistributionWidget.set(result);
  }

  dateRanges() {
    return this.getDateRanges(this._currentFilterOption, 8);
  }

  initChartView() {
    this.salesChartViewLoading = true;
    this.salesChartView().loadTotalSalesChart(this.userId, this.dateRanges(), () => {
      this.salesChartViewLoading = false;
    });
    setTimeout(() => {
      this.salesPerAgentChartViewLoading = true;
      this.salesPerAgentChartView().loadTotalSalesChart(this.getDateRange(this._currentFilterOption), () => {
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
}
