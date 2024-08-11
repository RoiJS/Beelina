import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';

import { UserAccountService } from 'src/app/_services/user-account.service';

@Component({
  selector: 'app-agreement-confirmation',
  templateUrl: './agreement-confirmation.component.html',
  styleUrls: ['./agreement-confirmation.component.scss']
})
export class AgreementConfirmationComponent implements OnInit {
  userService = inject(UserAccountService)
  bottomSheetRef = inject(MatBottomSheetRef<AgreementConfirmationComponent>);
  formBuilder = inject(FormBuilder);

  private _agreementConfirmationForm: FormGroup;

  constructor() {
    this._agreementConfirmationForm = this.formBuilder.group({
      confirm: [false],
      paid: [false]
    });
  }

  ngOnInit() {
  }

  onCancel() {
    this.bottomSheetRef.dismiss();
  }

  onConfirm() {
    const confirm = this._agreementConfirmationForm.get('confirm').value;
    const paid = this._agreementConfirmationForm.get('paid').value;
    this.bottomSheetRef.dismiss({ confirm, paid });
  }

  get agreementConfirmationForm(): FormGroup {
    return this._agreementConfirmationForm;
  }
}
