import { Component, inject, OnInit } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { PrintForSettingsEnum } from 'src/app/_enum/print-for-settings.enum';

@Component({
  selector: 'app-print-option-dialog',
  templateUrl: './print-option-dialog.component.html',
  styleUrls: ['./print-option-dialog.component.scss']
})
export class PrintOptionDialogComponent implements OnInit {

  private _bottomSheetRef = inject(MatBottomSheetRef<PrintOptionDialogComponent>);

  constructor() { }

  ngOnInit() { }

  forSalesAgent() {
    this._bottomSheetRef.dismiss({
      printForSettingsEnum: PrintForSettingsEnum.SALES_AGENT
    });
  }

  forCustomer() {
    this._bottomSheetRef.dismiss({
      printForSettingsEnum: PrintForSettingsEnum.CUSTOMER
    });
  }

  onCancel() {
    this._bottomSheetRef.dismiss();
  }
}
