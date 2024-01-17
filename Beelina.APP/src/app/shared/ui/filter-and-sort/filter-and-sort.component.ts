import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';

import { SortOrderOptionsEnum } from 'src/app/_enum/sort-order-options.enum';
import moment from 'moment';

@Component({
  selector: 'app-filter-and-sort',
  templateUrl: './filter-and-sort.component.html',
  styleUrls: ['./filter-and-sort.component.scss'],
})
export class FilterAndSortComponent implements OnInit {
  private _filterForm: FormGroup;

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<FilterAndSortComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: {
      fromDate: string;
      toDate: string;
      sortOrder: SortOrderOptionsEnum;
    },
    private formBuilder: FormBuilder
  ) {
    this._filterForm = this.formBuilder.group({
      dateFrom: [data.fromDate],
      dateTo: [data.toDate],
      sortOrder: [data.sortOrder],
    });
  }

  ngOnInit() {}

  onReset() {
    this._bottomSheetRef.dismiss({
      dateFrom: null,
      dateTo: null,
      sortOrder: SortOrderOptionsEnum.DESCENDING,
    });
  }

  onCancel() {
    this._bottomSheetRef.dismiss();
  }

  onConfirm() {
    const dateFromValue = this._filterForm.get('dateFrom').value;
    const dateToValue = this._filterForm.get('dateTo').value;
    const sortOrderValue = this._filterForm.get('sortOrder').value;

    const dateFrom = dateFromValue
      ? moment(dateFromValue).format('YYYY-MM-DD')
      : null;
    const dateTo = dateToValue
      ? moment(dateToValue).format('YYYY-MM-DD')
      : null;
    const sortOrder = sortOrderValue ?? SortOrderOptionsEnum.DESCENDING;
    this._bottomSheetRef.dismiss({ dateFrom, dateTo, sortOrder });
  }

  get filterForm(): FormGroup {
    return this._filterForm;
  }
}
