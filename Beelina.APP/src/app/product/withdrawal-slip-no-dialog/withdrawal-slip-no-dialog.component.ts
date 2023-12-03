import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-withdrawal-slip-no-dialog',
  templateUrl: './withdrawal-slip-no-dialog.component.html',
  styleUrls: ['./withdrawal-slip-no-dialog.component.scss']
})
export class WithdrawalSlipNoDialogComponent implements OnInit {

  private _productWithDrawalForm: FormGroup;

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<WithdrawalSlipNoDialogComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: {
      additionalStockQuantity: number;
      withdrawalSlipNo: string;
    },
    private formBuilder: FormBuilder
  ) {
    this._productWithDrawalForm = this.formBuilder.group({
      withdrawalSlipNo: [data.withdrawalSlipNo],
      additionalStockQuantity: [data.additionalStockQuantity],
    });
  }

  ngOnInit() { }

  onCancel() {
    this._bottomSheetRef.dismiss();
  }

  onConfirm() {
    const additionalStockQuantity = this._productWithDrawalForm.get('additionalStockQuantity').value;
    const withdrawalSlipNo = this._productWithDrawalForm.get('withdrawalSlipNo').value;
    this._bottomSheetRef.dismiss({ additionalStockQuantity, withdrawalSlipNo });
  }

  get productWithdrawalForm(): FormGroup {
    return this._productWithDrawalForm;
  }
}
