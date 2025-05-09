import { Component, inject } from '@angular/core';
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
export class FilterAndSortComponent {
  private _filterForm: FormGroup;

  private _bottomSheetRef = inject(MatBottomSheetRef<FilterAndSortComponent>);
  private formBuilder = inject(FormBuilder);
  private data = inject<{
    fromDate: string;
    toDate: string;
    sortOrder: SortOrderOptionsEnum;
  }>(MAT_BOTTOM_SHEET_DATA);

  constructor() {
    this._filterForm = this.formBuilder.group({
      dateFrom: [this.data.fromDate],
      dateTo: [this.data.toDate],
      sortOrder: [this.data.sortOrder],
    });
  }

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
