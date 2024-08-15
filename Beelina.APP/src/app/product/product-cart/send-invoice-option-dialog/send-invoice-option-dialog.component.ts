import { Component, inject, OnInit } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { PrintForSettingsEnum } from 'src/app/_enum/print-for-settings.enum';

@Component({
  selector: 'app-send-invoice-option-dialog',
  templateUrl: './send-invoice-option-dialog.component.html',
  styleUrls: ['./send-invoice-option-dialog.component.scss']
})
export class SendInvoiceOptionDialogComponent implements OnInit {

  private _bottomSheetRef = inject(MatBottomSheetRef<SendInvoiceOptionDialogComponent>);

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
