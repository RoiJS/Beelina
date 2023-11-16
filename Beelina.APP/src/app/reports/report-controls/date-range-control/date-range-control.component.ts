import { Component, OnInit } from '@angular/core';
import { BaseControlComponent } from '../base-control/base-control.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-date-range',
  templateUrl: './date-range-control.component.html',
  styleUrls: ['./date-range-control.component.scss'],
})
export class DateRangeControlComponent
  extends BaseControlComponent
  implements OnInit
{
  private _form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    protected override translateService: TranslateService
  ) {
    super(translateService);

    this._form = this.formBuilder.group({
      dateFrom: [null],
      dateTo: [null],
    });
  }

  override ngOnInit() {}

  override value(value: any): { dateFrom: string; dateTo: string } {
    const dateFrom = this._form.get('dateFrom').value;
    const dateTo = this._form.get('dateTo').value;
    return { dateFrom, dateTo };
  }

  get form(): FormGroup {
    return this._form;
  }
}
