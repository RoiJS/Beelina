import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';

import { DateFormatter } from '../_helpers/formatters/date-formatter.helper';
import { NumberFormatter } from '../_helpers/formatters/number-formatter.helper';

import {
  TransactionSales,
  TransactionService,
} from '../_services/transaction.service';
import { BaseComponent } from '../shared/components/base-component/base.component';
import { AuthService } from '../_services/auth.service';
import { errorCodes } from '@apollo/client/invariantErrorCodes';
import { DateRange } from '../_models/date-range';
import { SalesPerDateRange } from '../_models/sales-per-date-range';

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
  protected _sales: number = 0;
  protected _currentFilterOption: DateFilterEnum = DateFilterEnum.Monthly;
  protected _weekOptions: Array<string>;
  protected _monthOptions: Array<string> = [
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

  protected _filterForm: FormGroup;

  constructor(
    protected authService: AuthService,
    protected formBuilder: FormBuilder,
    protected transactionService: TransactionService
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
    const userId = this.authService.userId;
    const dateFilters = this.getDateRange(filterOption);
    this._isLoading = true;
    this.transactionService
      .getTransactionSales(userId, dateFilters.fromDate, dateFilters.toDate)
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

  getDateRanges(filterType: DateFilterEnum, duration: number): DateRange[] {
    if (filterType === DateFilterEnum.Daily) {
      return this.getStartDateAndEndDate(this._filterForm.get('day').value, duration);
    } else if (filterType === DateFilterEnum.Weekly) {
      return this.getDateRangeFromWeekNumber(this._filterForm.get('week').value + 1, duration);
    } else if (filterType === DateFilterEnum.Monthly) {
      return this.getDateRangesForMonths(this._filterForm.get('month').value, duration);
    } else {
      throw new Error('Invalid date filter type');
    }
  }

  private getStartDateAndEndDate(startDate: string, numberOfDays: number): DateRange[] {
    const dates: DateRange[] = [];
    const start = moment(startDate);

    for (let i = numberOfDays - 1; i >= 0; i--) {
      const current = start.clone().add(-i, 'days');
      dates.push(<DateRange>{
        fromDate: current.format('YYYY-MM-DD'),
        toDate: current.format('YYYY-MM-DD'),
        label: current.format('MMM DD, YYYY'),
      });
    }
    return dates;
  }

  private getDateRangeFromWeekNumber(currentWeek: number, numberOfWeeks: number): DateRange[] {
    const dateRanges: DateRange[] = [];

    for (let i = numberOfWeeks - 1; i >= 0; i--) {
      const weekStartDate = this.getDateOfWeek(currentWeek - i, new Date().getFullYear());
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekStartDate.getDate() + 6); // Add 6 days to get the end date of the week

      const numberOfAvailableWeeks = this.weeksInYear(weekStartDate.getFullYear());
      let weekNumber = numberOfAvailableWeeks + ((currentWeek - 1) - (i - 1));
      if (weekNumber > numberOfAvailableWeeks) {
        weekNumber = weekNumber % numberOfAvailableWeeks;
      }
      dateRanges.push((<DateRange>{
        fromDate: DateFormatter.format(weekStartDate),
        toDate: DateFormatter.format(weekEndDate),
        label: `Week ${weekNumber}`
      }));
    }

    return dateRanges;
  }

  private getDateRangesForMonths(currentMonth: number, numberOfMonths: number): DateRange[] {
    const dateRanges: DateRange[] = [];

    // for (let i = 0; i < numberOfMonths; i++) {
    for (let i = numberOfMonths - 1; i >= 0; i--) {
      const monthToCalculate = Math.abs((currentMonth + 12) - i);
      const year = (new Date()).getFullYear() + Math.floor((monthToCalculate - 12) / 12);
      const month = monthToCalculate % 12;
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0); // Set day as 0 to get the last day of the currentMonth

      dateRanges.push(<DateRange>{
        fromDate: DateFormatter.format(startDate),
        toDate: DateFormatter.format(endDate),
        label: `${this._monthOptions[month]}`
      });
    }

    return dateRanges;
  }

  protected getWeekNumber(d: Date) {
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

  protected weeksInYear(year) {
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

  protected getDateOfWeek(w, y) {
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
