import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { UserAccountInformationResult } from 'src/app/_models/results/user-account-information-result';
import { UserAccountService } from 'src/app/_services/user-account.service';
import { BaseComponent } from '../components/base-component/base.component';

@Component({
  selector: 'app-account-verification',
  templateUrl: './account-verification.component.html',
  styleUrls: ['./account-verification.component.scss'],
})
export class AccountVerificationComponent
  extends BaseComponent
  implements OnInit {
  private _accountVerificationForm: FormGroup;

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<AccountVerificationComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: {
      defaultUsername: string;
    },
    private userAccountService: UserAccountService,
    private formBuilder: FormBuilder
  ) {
    super();
    this._accountVerificationForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });

    this._accountVerificationForm
      .get('username')
      .setValue(this.data.defaultUsername);
  }

  ngOnInit() { }

  onCancel() {
    this._bottomSheetRef.dismiss();
  }

  onConfirm() {
    const username = this._accountVerificationForm.get('username').value;
    const password = this._accountVerificationForm.get('password').value;

    this._isLoading = true;
    this.userAccountService.verifyUserAccount(username, password).subscribe({
      next: (data: UserAccountInformationResult) => {
        this._isLoading = false;
        this._bottomSheetRef.dismiss(data);
      },
      error: () => {
        this._isLoading = false;
        this._bottomSheetRef.dismiss(null);
      },
    });
  }

  get accountVerificationForm(): FormGroup {
    return this._accountVerificationForm;
  }
}
