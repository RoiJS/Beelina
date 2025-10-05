import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-copy-product-confirmation',
  templateUrl: './copy-product-confirmation.component.html',
  styleUrls: ['./copy-product-confirmation.component.scss']
})
export class CopyProductConfirmationComponent {
  bottomSheetRef = inject(MatBottomSheetRef<CopyProductConfirmationComponent>);
  formBuilder = inject(FormBuilder);
  data = inject(MAT_BOTTOM_SHEET_DATA);

  private _copyProductConfirmationForm: FormGroup;

  constructor() {
    this._copyProductConfirmationForm = this.formBuilder.group({
      setValidToDate: [false] // Default to false
    });
  }

  onCancel() {
    this.bottomSheetRef.dismiss();
  }

  onConfirm() {
    const setValidToDate = this._copyProductConfirmationForm.get('setValidToDate').value;
    this.bottomSheetRef.dismiss({ confirm: true, setValidToDate });
  }

  get copyProductConfirmationForm(): FormGroup {
    return this._copyProductConfirmationForm;
  }

  get productName(): string {
    return this.data?.productName || '';
  }
}
