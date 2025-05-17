import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import {
  SortOrderOptionsEnum,
  SortOrderOptionsNumberEnum,
} from 'src/app/_enum/sort-order-options.enum';
import { BaseControlComponent } from '../base-control/base-control.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-sort-order-control',
  templateUrl: './sort-order-control.component.html',
  styleUrls: ['./sort-order-control.component.scss'],
})
export class SortOrderControlComponent
  extends BaseControlComponent
  implements OnInit {

  private _form: FormGroup;
  private _formBuilder = inject(FormBuilder);

  constructor(protected override translateService: TranslateService) {
    super(translateService);

    this._form = this._formBuilder.group({
      sortOrder: [SortOrderOptionsEnum.DESCENDING],
    });
  }

  override ngOnInit() { }

  override value(value: any) {
    const currentValue = this._form.get('sortOrder').value;
    const sortOrderValue =
      currentValue === SortOrderOptionsEnum.ASCENDING
        ? SortOrderOptionsNumberEnum.ASCENDING
        : SortOrderOptionsNumberEnum.DESCENDING;
    return sortOrderValue.toString();
  }

  get form(): FormGroup {
    return this._form;
  }
}
