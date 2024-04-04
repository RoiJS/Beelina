import { Injectable } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { BehaviorSubject } from 'rxjs';

import { Transaction } from './transaction.service';
import { TransactionOptionMenuComponent } from '../shared/ui/transaction-option-menu/transaction-option-menu.component';

@Injectable({
  providedIn: 'root'
})
export class TransactionOptionsService {
  private _bottomSheet: MatBottomSheet;
  private _optionDismissedSub = new BehaviorSubject<boolean>(false);

  constructor() { }

  setBottomSheet(bottomSheet: MatBottomSheet) {
    this._bottomSheet = bottomSheet;
    return this;
  }

  openMenu(transaction: Transaction) {
    this._bottomSheet.open(TransactionOptionMenuComponent, {
      data: {
        transaction
      },
    })
      .afterDismissed()
      .subscribe((data: boolean) => {
        this.optionDismissedSub.next(data);
      });
  }

  get optionDismissedSub() {
    return this._optionDismissedSub;
  }
}
