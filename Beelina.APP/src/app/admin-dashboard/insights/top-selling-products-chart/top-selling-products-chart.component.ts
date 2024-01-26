import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexPlotOptions, ApexStroke, ApexTitleSubtitle, ApexTooltip, ApexXAxis, ApexYAxis, ChartComponent } from 'ng-apexcharts';
import { Subscription } from 'rxjs';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { TopSellingProduct, TransactionService } from 'src/app/_services/transaction.service';
import { topSellingProductsSelector } from 'src/app/product/top-products/store/selectors';
import * as TopSellingProductActions from '../../../product/top-products/store/actions';
import { AuthService } from 'src/app/_services/auth.service';
import { NumberFormatter } from 'src/app/_helpers/formatters/number-formatter.helper';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  tooltip: ApexTooltip;
  colors: string[];
  title: ApexTitleSubtitle;
  subtitle: ApexTitleSubtitle;
};

@Component({
  selector: 'app-top-selling-products-chart',
  templateUrl: './top-selling-products-chart.component.html',
})
export class TopSellingProductsChartComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild(ChartComponent) chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  private _subscription = new Subscription();
  private _topSellingProducts: Array<TopSellingProduct>;

  constructor(
    private authService: AuthService,
    private transactionService: TransactionService,
  ) {

    this.chartOptions = {
      series: [
        {
          data: []
        }
      ],
      chart: {
        type: "bar",
      },
      plotOptions: {
        bar: {
          barHeight: "100%",
          distributed: true,
          horizontal: true,
          dataLabels: {
            position: "bottom"
          },
        }
      },
      colors: [
        "#33b2df",
        "#546E7A",
        "#d4526e",
        "#13d8aa",
        "#A5978B",
        "#2b908f",
        "#f9a3a4",
        "#90ee7e",
        "#f48024",
        "#69d2e7"
      ],
      dataLabels: {
        enabled: true,
        textAnchor: "start",
        style: {
          colors: ["#fff"]
        },
        formatter: function (val, opt) {
          return `${opt.w.globals.labels[opt.dataPointIndex]}: ${NumberFormatter.formatCurrency(<any>val).toString()}`;
        },
        offsetX: 0,
        dropShadow: {
          enabled: true
        }
      },
      stroke: {
        width: 1,
        colors: ["#fff"]
      },
      xaxis: {
        categories: []
      },
      yaxis: {
        labels: {
          show: false
        }
      },
      tooltip: {
        theme: "dark",
        x: {
          show: false
        },
        y: {
          title: {
            formatter: function (val) {
              return "";
            }
          },
          formatter: function (val) {
            return NumberFormatter.formatCurrency(val).toString();
          }
        }
      }
    };
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this._subscription.add(
      this.transactionService
        .getTopSellingProducts(+this.authService.userId, false)
        .subscribe((data: { topSellingProducts: Array<TopSellingProduct> }) => {
          setTimeout(() => {
            this._topSellingProducts = data.topSellingProducts.slice(0, 10);
            this.chartOptions.xaxis.categories = this._topSellingProducts.map(x => `${x.code}: ${x.name}`);
            this.chartOptions.series[0].data = this._topSellingProducts.map(x => x.totalAmount);
            this.chartOptions = {
              ...this.chartOptions, // Preserve other options
              xaxis: {
                categories: this._topSellingProducts.map(x => `${x.code}: ${x.name}`)
              }
            };
            this.chart?.updateOptions(this.chartOptions);
          }, 500);
        })
    );
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }
}
