import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ApexChart, ApexDataLabels, ApexNonAxisChartSeries, ApexPlotOptions, ApexResponsive, ChartComponent } from 'ng-apexcharts';

import { NumberFormatter } from 'src/app/_helpers/formatters/number-formatter.helper';
import { TransactionSalesPerSalesAgent } from 'src/app/_models/sales-per-agent';
import { AuthService } from 'src/app/_services/auth.service';
import { TransactionService } from 'src/app/_services/transaction.service';
import { SalesComponent } from 'src/app/sales/sales.component';

export type DonutChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
};

@Component({
  selector: 'app-sales-per-agent-view',
  templateUrl: './sales-per-agent-view.component.html',
  styleUrls: ['./sales-per-agent-view.component.scss']
})
export class SalesPerAgentViewComponent extends SalesComponent implements OnInit {
  @ViewChild(ChartComponent) chart: ChartComponent;
  public chartOptions: Partial<DonutChartOptions>;

  constructor(
    protected override authService: AuthService,
    protected override formBuilder: FormBuilder,
    protected override transactionService: TransactionService) {
    super(authService, formBuilder, transactionService);

    this.chartOptions = {
      series: [],
      chart: {
        type: "donut",
        width: 600
      },
      labels: [],
      dataLabels: {},
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '22px',
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: 600,
                color: undefined,
                offsetY: -10,
                formatter: function (val) {
                  return val
                }
              },
              value: {
                show: true,
                fontSize: '16px',
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: 400,
                color: undefined,
                offsetY: 16,
                formatter: function (val) {
                  return NumberFormatter.formatCurrency(+val).toString();
                }
              },
              total: {
                show: true,
                showAlways: true,
                label: 'Total',
                fontSize: '22px',
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: 600,
                color: '#373d3f',
                formatter: function (w) {
                  const total = w.globals.seriesTotals.reduce((a, b) => {
                    return a + b
                  }, 0)
                  return NumberFormatter.formatCurrency(total).toString();
                }
              }
            }
          }
        }
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ]
    };

  }

  override ngOnInit() {
  }

  loadTotalSalesChart(dateRange: {
    fromDate: string;
    toDate: string;
  }, callback: Function) {
    this._isLoading = true;
    this.transactionService
      .getTransactionSalesForAllPerDateRange(dateRange.fromDate, dateRange.toDate)
      .subscribe((salesFromAllAgents: Array<TransactionSalesPerSalesAgent>) => {
        this._isLoading = false;
        this.chartOptions.labels = salesFromAllAgents.map(x => x.salesAgentName);
        this.chartOptions.series = salesFromAllAgents.map(x => x.sales);

        if (callback) {
          callback();
        }
      });
  }
}
