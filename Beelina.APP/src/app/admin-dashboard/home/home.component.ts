import { AfterViewInit, Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, take } from 'rxjs/operators';

import { AuthService } from 'src/app/_services/auth.service';
import { TransactionService } from 'src/app/_services/transaction.service';
import { ProductService } from 'src/app/_services/product.service';
import { SalesComponent } from 'src/app/sales/sales.component';
import { SalesChartViewComponent } from './sales-chart-view/sales-chart-view.component';
import { SalesPerAgentViewComponent } from './sales-per-agent-view/sales-per-agent-view.component';
import { LocalClientSubscriptionDbService } from 'src/app/_services/local-db/local-client-subscription-db.service';
import { ClientSubscriptionDetails } from 'src/app/_models/client-subscription-details.model';
import { SubscriptionFeatureHideDashboardWidget } from 'src/app/_models/subscription-feature-hide-dashboard-widget.model';
import { ProfitBreakdown } from 'src/app/_models/profit-breakdown.model';
import { NumberFormatter } from 'src/app/_helpers/formatters/number-formatter.helper';
import { DateFilterEnum } from 'src/app/_enum/date-filter.enum';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent extends SalesComponent implements OnInit, AfterViewInit {
  private userId: number;
  protected _profitBreakdown: ProfitBreakdown = new ProfitBreakdown();
  protected _warehouseInventoryValue: number = 0;

  salesChartView = viewChild(SalesChartViewComponent);
  salesPerAgentChartView = viewChild(SalesPerAgentViewComponent);
  clientSubscriptionDetails: ClientSubscriptionDetails;
  salesChartViewLoading: boolean;
  salesPerAgentChartViewLoading: boolean;

  localClientSubscriptionDbService = inject(LocalClientSubscriptionDbService);
  productService = inject(ProductService);

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
    return this.getDateRanges(this._currentFilterOption, 5);
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

  override getTransactionSales(filterOption: DateFilterEnum) {
    const userId = this.authService.userId;
    const dateFilters = this.getDateRange(filterOption);
    const warehouseId = 1; // Default warehouse - adjust as needed for your business logic
    this._isLoading = true;

    // Combine sales, profit, and warehouse inventory data with error handling
    // Note: Consider switching to switchMap/takeUntilDestroyed if cancelling in-flight requests on rapid filter changes is desired
    forkJoin({
      sales: this.transactionService
        .getTransactionSales(userId, dateFilters.fromDate, dateFilters.toDate)
        .pipe(
          take(1), // Ensure the observable completes for forkJoin
          catchError(() => of({
            totalSalesAmount: 0,
            cashAmountOnHand: 0,
            chequeAmountOnHand: 0,
            accountReceivables: 0,
            badOrderAmount: 0
          }))
        ),
      profit: this.transactionService
        .getProfitBreakdown(userId, dateFilters.fromDate, dateFilters.toDate)
        .pipe(
          take(1), // Ensure the observable completes for forkJoin
          catchError(() => of(new ProfitBreakdown()))
        ),
      warehouseInventory: this.productService
        .getWarehouseTotalInventoryValue(warehouseId)
        .pipe(
          take(1), // Ensure the observable completes for forkJoin
          catchError(() => of(0))
        )
    }).pipe(
      finalize(() => this._isLoading = false)
    ).subscribe((result) => {
      this._sales = result.sales.totalSalesAmount;
      this._cashOnHand = result.sales.cashAmountOnHand;
      this._chequeOnHand = result.sales.chequeAmountOnHand;
      this._accountReceivables = result.sales.accountReceivables;
      this._badOrders = result.sales.badOrderAmount;
      this._profitBreakdown = result.profit;
      this._warehouseInventoryValue = result.warehouseInventory;
    });
  }

  get salesProfit(): string {
    return NumberFormatter.formatCurrency(this._profitBreakdown.salesPriceProfit);
  }

  get purchaseOrderDiscountProfit(): string {
    return NumberFormatter.formatCurrency(this._profitBreakdown.purchaseOrderDiscountProfit);
  }

  get totalProfit(): string {
    return NumberFormatter.formatCurrency(this._profitBreakdown.totalProfit);
  }

  get warehouseInventoryValue(): string {
    return NumberFormatter.formatCurrency(this._warehouseInventoryValue);
  }
}
