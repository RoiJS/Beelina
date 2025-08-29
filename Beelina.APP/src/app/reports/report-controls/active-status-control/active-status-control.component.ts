import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { BaseControlComponent } from '../base-control/base-control.component';

@Component({
  selector: 'app-active-status-control',
  templateUrl: './active-status-control.component.html',
  styleUrls: ['./active-status-control.component.scss'],
})
export class ActiveStatusControlComponent
  extends BaseControlComponent
  implements OnInit {

  private _form: FormGroup;
  private _formBuilder = inject(FormBuilder);

  constructor(protected override translateService: TranslateService) {
    super(translateService);

    this._form = this._formBuilder.group({
      activeStatus: ['1'], // Default to 'Active Only'
    });
  }

  override ngOnInit() { }

  override value(value: any = null): any {
    if (value !== null && value !== undefined) {
      // Setting value
      this._form.get('activeStatus')?.setValue(value);
      return value;
    } else {
      // Getting value
      return this._form.get('activeStatus')?.value || '1';
    }
  }

  override validate(): boolean {
    return this._form.valid;
  }

  get form(): FormGroup {
    return this._form;
  }
}
