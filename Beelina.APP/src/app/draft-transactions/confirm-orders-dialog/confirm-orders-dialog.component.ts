import { Component, Inject, inject, OnInit, signal } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { TranslateService } from '@ngx-translate/core';

import { InvalidProductTransactionOverallQuantitiesTransactions } from 'src/app/_models/insufficient-product-quantity';

@Component({
  selector: 'app-confirm-orders-dialog',
  templateUrl: './confirm-orders-dialog.component.html',
  styleUrls: ['./confirm-orders-dialog.component.scss']
})
export class ConfirmOrdersDialogComponent implements OnInit {

  translateService = inject(TranslateService);
  private _bottomSheetRef = inject(MatBottomSheetRef<ConfirmOrdersDialogComponent>);

  confirmationMessage = signal<string>("");

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: {
      selectedItems: Array<number>;
      productsWithInsufficientQuantities: Array<InvalidProductTransactionOverallQuantitiesTransactions>
    },
  ) {

    if (data.productsWithInsufficientQuantities.length > 0) {
      if (data.productsWithInsufficientQuantities.length === data.selectedItems.length) {
        this.confirmationMessage.set(
          this.translateService.instant("DRAFT_TRANSACTIONS_PAGE.CONFIRM_ORDERS_DIALOG.ALL_INVALID_MESSAGE")
        );
      } else {
        this.confirmationMessage.set(
          this.translateService.instant("DRAFT_TRANSACTIONS_PAGE.CONFIRM_ORDERS_DIALOG.SOME_INVALID_MESSAGE").replace("{0}", data.productsWithInsufficientQuantities.length)
        );
      }
    } else {
      this.confirmationMessage.set(
        this.translateService.instant("DRAFT_TRANSACTIONS_PAGE.CONFIRM_ORDERS_DIALOG.ALL_VALID_MESSAGE")
      );
    }
  }

  ngOnInit() { }

  onConfirm() {
    const selectedItems = this.data.selectedItems.filter(item => !this.data.productsWithInsufficientQuantities.map(item => item.transactionId).includes(item));

    this._bottomSheetRef.dismiss({
      selectedItems,
      confirm: true,
    });
  }

  onCancel() {
    this._bottomSheetRef.dismiss({
      selectedItems: this.data.selectedItems,
      confirm: false,
    });
  }

  isDisabled(): boolean {
    return this.data.productsWithInsufficientQuantities.length === this.data.selectedItems.length;
  }
}
