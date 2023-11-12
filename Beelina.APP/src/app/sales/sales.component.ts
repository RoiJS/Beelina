import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';

import { DateFormatter } from '../_helpers/formatters/date-formatter.helper';
import { NumberFormatter } from '../_helpers/formatters/number-formatter.helper';

import {
  TransactionSales,
  TransactionService,
} from '../_services/transaction.service';
import { BaseComponent } from '../shared/components/base-component/base.component';

export enum DateFilterEnum {
  Daily = 1,
  Weekly = 2,
  Monthly = 3,
}

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss'],
})
export class SalesComponent extends BaseComponent implements OnInit {
  private _sales: number = 0;
  private _currentFilterOption: DateFilterEnum = DateFilterEnum.Daily;
  private _weekOptions: Array<string>;
  private _monthOptions: Array<string> = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  private _filterForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private transactionService: TransactionService
  ) {
    super();
    const currentYear = new Date().getFullYear();
    const numberOfWeeks = this.weeksInYear(currentYear);

    this._weekOptions = Array.from(
      { length: numberOfWeeks },
      (_, i) => `Week ${i + 1}`
    );

    const currentWeekNumber = this.getWeekNumber(new Date())[1] - 1;
    const currentMonthNumber = new Date().getMonth();

    this._filterForm = this.formBuilder.group({
      day: [new Date()],
      week: [currentWeekNumber],
      month: [currentMonthNumber],
    });
  }

  ngOnInit() {
    this.getTransactionSales(this._currentFilterOption);
  }

  getTransactionSales(filterOption: DateFilterEnum) {
    const dateFilters = this.getDateRange(filterOption);
    this._isLoading = true;
    this.transactionService
      .getTransactionSales(dateFilters.fromDate, dateFilters.toDate)
      .subscribe((transactionSales: TransactionSales) => {
        this._isLoading = false;
        this._sales = transactionSales.sales;
      });
  }

  setFilterOption(filterOption: DateFilterEnum) {
    this._currentFilterOption = filterOption;
    this.getTransactionSales(filterOption);
  }

  dateChange(e) {
    this.getTransactionSales(DateFilterEnum.Daily);
  }

  weekChange(e) {
    this.getTransactionSales(DateFilterEnum.Weekly);
  }

  monthChange(e) {
    this.getTransactionSales(DateFilterEnum.Monthly);
  }

  getDateRange(filterOption: DateFilterEnum): {
    fromDate: string;
    toDate: string;
  } {
    let fromDate,
      toDate = null;

    switch (filterOption) {
      case DateFilterEnum.Daily:
        fromDate = this._filterForm.get('day').value;
        toDate = this._filterForm.get('day').value;
        break;
      case DateFilterEnum.Weekly:
        const weekStartDate = this.getDateOfWeek(
          this._filterForm.get('week').value + 1,
          new Date().getFullYear()
        );
        fromDate = weekStartDate;
        toDate = moment(weekStartDate).add(6, 'd');
        break;
      case DateFilterEnum.Monthly:
        const month = this._filterForm.get('month').value;
        fromDate = new Date(new Date().getFullYear(), month, 1);
        toDate = new Date(new Date().getFullYear(), month + 1, 0);
        break;
    }
    return {
      fromDate: DateFormatter.format(fromDate),
      toDate: DateFormatter.format(toDate),
    };
  }

  private getWeekNumber(d: Date) {
    // Copy date so don't modify original
    d = new Date(+d);
    d.setHours(0, 0, 0, 0);
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    // Get first day of year
    let yearStart = new Date(d.getFullYear(), 0, 1);
    // Calculate full weeks to nearest Thursday
    let weekNo = Math.ceil(
      ((d.valueOf() - yearStart.valueOf()) / 86400000 + 1) / 7
    );
    // Return array of year and week number
    return [d.getFullYear(), weekNo];
  }

  private weeksInYear(year) {
    var month = 11,
      day = 31,
      week;

    // Find week that 31 Dec is in. If is first week, reduce date until
    // get previous week.
    do {
      const d = new Date(year, month, day--);
      week = this.getWeekNumber(d)[1];
    } while (week == 1);

    return week;
  }

  private getDateOfWeek(w, y) {
    var d = 1 + (w - 1) * 7; // 1st of January + 7 days for each week

    return new Date(y, 0, d);
  }

  get currentFilterOption(): DateFilterEnum {
    return this._currentFilterOption;
  }

  get weekOptions(): Array<string> {
    return this._weekOptions;
  }

  get monthlyOptions(): Array<string> {
    return this._monthOptions;
  }

  get sales(): string {
    return NumberFormatter.formatCurrency(this._sales);
  }

  get filterForm(): FormGroup {
    return this._filterForm;
  }

  get maxDate(): Date {
    return new Date();
  }
}
