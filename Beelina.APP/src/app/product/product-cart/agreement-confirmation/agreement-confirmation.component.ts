import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-agreement-confirmation',
  templateUrl: './agreement-confirmation.component.html',
  styleUrls: ['./agreement-confirmation.component.scss']
})
export class AgreementConfirmationComponent implements OnInit {
  private _agreementConfirmationForm: FormGroup;
  constructor(
    public _bottomSheetRef: MatBottomSheetRef<AgreementConfirmationComponent>,
    private formBuilder: FormBuilder
  ) {
    this._agreementConfirmationForm = this.formBuilder.group({
      confirm: [false],
    });
  }

  ngOnInit() {
  }

  onCancel() {
    this._bottomSheetRef.dismiss();
  }

  onConfirm() {
    const confirm = this._agreementConfirmationForm.get('confirm').value;
    this._bottomSheetRef.dismiss({ confirm });
  }

  get agreementConfirmationForm(): FormGroup {
    return this._agreementConfirmationForm;
  }
}
