import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';

import { BaseControlComponent } from '../base-control/base-control.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
})
export class DatePickerComponent
  extends BaseControlComponent
  implements OnInit {
  private _form: FormGroup;
  private _formBuilder = inject(FormBuilder);

  constructor(protected override translateService: TranslateService) {
    super(translateService);

    this._form = this._formBuilder.group({
      date: [new Date(), [Validators.required]],
    });
  }

  override ngOnInit() { }

  override value(value: any): string {
    const date = this._form.get('date').value;
    return moment(date).format('yyyy-MM-DD');
  }

  override validate(): boolean {
    this._form.markAllAsTouched();
    return this._form.valid;
  }

  get form(): FormGroup {
    return this._form;
  }
}
