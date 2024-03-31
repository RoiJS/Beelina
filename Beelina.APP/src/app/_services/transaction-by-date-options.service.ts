import { Injectable } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';

import { TransactionDateInformation } from './transaction.service';
import { TransactionDateOptionMenuComponent } from '../shared/ui/transaction-date-option-menu/transaction-date-option-menu.component';
import { TransactionStatusEnum } from '../_enum/transaction-status.enum';

@Injectable({
  providedIn: 'root'
})
export class TransactionByDateOptionsService {
  private _bottomSheet: MatBottomSheet;

  constructor() { }

  setBottomSheet(bottomSheet: MatBottomSheet) {
    this._bottomSheet = bottomSheet;
    return this;
  }

  openMenu(transactionDateInformation: TransactionDateInformation, transactionStatus: TransactionStatusEnum) {
    this._bottomSheet.open(TransactionDateOptionMenuComponent, {
      data: {
        transactionDateInformation,
        transactionStatus
      },
    });
  }
}
