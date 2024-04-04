import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SalesPerDateRange } from 'src/app/_models/sales-per-date-range';
import { AuthService } from 'src/app/_services/auth.service';
import { TransactionService } from 'src/app/_services/transaction.service';
import { SalesComponent } from 'src/app/sales/sales.component';

import {
  ChartComponent,
  ChartType
} from "ng-apexcharts";
import { NumberFormatter } from 'src/app/_helpers/formatters/number-formatter.helper';
import { TranslateService } from '@ngx-translate/core';
import { DateRange } from 'src/app/_models/date-range';

import { ChartOptions } from 'src/app/_models/chart-option.model';

@Component({
  selector: 'app-sales-chart-view',
  templateUrl: './sales-chart-view.component.html',
  styleUrls: ['./sales-chart-view.component.scss']
})
export class SalesChartViewComponent extends SalesComponent implements OnInit {
  @Input() chartType: ChartType = 'bar';

  @ViewChild(ChartComponent) chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  constructor(
    private translateService: TranslateService,
    protected override authService: AuthService,
    protected override formBuilder: FormBuilder,
    protected override transactionService: TransactionService) {
    super(authService, formBuilder, transactionService);

    this.chartOptions = {
      series: [
        {
          name: this.translateService.instant('DASHBOARD_ADMIN.HOME_PAGE.CHART_SECTION.SALES_LABEL'),
          data: []
        },
        {
          name: this.translateService.instant('DASHBOARD_ADMIN.HOME_PAGE.CHART_SECTION.CASH_ON_HAND_LABEL'),
          data: []
        },
        {
          name: this.translateService.instant('DASHBOARD_ADMIN.HOME_PAGE.CHART_SECTION.CHEQUE_ON_HAND_LABEL'),
          data: []
        }
      ],
      chart: {
        height: 200,
        width: 800,
        type: this.chartType,
      },
      plotOptions: {
        bar: {
          dataLabels: {
            position: "top"
          },
          horizontal: false,
          columnWidth: "55%",
          borderRadius: 2
        }
      },
      dataLabels: {
        enabled: false,
        formatter: function (val: number) {
          return NumberFormatter.formatCurrency(val).toString();
        },
        offsetY: -20,
        style: {
          fontSize: "13px",
          colors: ["#304758"]
        }
      },

      xaxis: {
        type: "category",
        categories: [],
        position: "bottom",
        labels: {
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
        crosshairs: {
          fill: {
            type: "gradient",
            gradient: {
              colorFrom: "#d89c2a",
              stops: [0, 100],
              opacityFrom: 0.4,
              opacityTo: 0.5
            }
          }
        },
        tooltip: {
          enabled: true,
          offsetY: -35
        }
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"]
      },
      yaxis: {
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
        labels: {
          show: false,
          formatter: function (val) {
            return NumberFormatter.formatCurrency(val).toString();
          }
        }
      },
    };
  }

  override ngOnInit() {
    super.ngOnInit();
  }

  loadTotalSalesChart(userId: number, dateRanges: DateRange[], callback: Function) {
    this.transactionService
      .getTransactionSalesPerDateRange(userId, dateRanges)
      .subscribe((transactionSalesPerDateRange: Array<SalesPerDateRange>) => {
        this.chartOptions.xaxis.categories = transactionSalesPerDateRange.map(x => x.label);
        this.chartOptions.series[0].data = transactionSalesPerDateRange.map(x => x.totalSales);
        this.chartOptions.series[1].data = transactionSalesPerDateRange.map(x => x.cashAmountOnHand);
        this.chartOptions.series[2].data = transactionSalesPerDateRange.map(x => x.chequeAmountOnHand);

        this.chartOptions = {
          ...this.chartOptions, // Preserve other options
          xaxis: {
            categories: transactionSalesPerDateRange.map(x => x.label)
          }
        };
        this.chart.updateOptions(this.chartOptions);

        if (callback) {
          callback();
        }
      });
  }
}
