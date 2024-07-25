import { Component, Inject, OnInit, signal } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';

import { Transaction } from 'src/app/_models/transaction';
import { MultipleEntitiesService } from 'src/app/_services/multiple-entities.service';

@Component({
  selector: 'app-view-selected-orders',
  templateUrl: './view-selected-orders.component.html',
  styleUrls: ['./view-selected-orders.component.scss']
})
export class ViewSelectedOrdersComponent implements OnInit {

  isSelectedAll = signal(false);
  currentSelectedItems = signal<Array<Transaction>>([]);
  selectedItems = signal<Array<Transaction>>([]);

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<ViewSelectedOrdersComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: {
      transactions: Array<Transaction>
    },
    public multipleItemsService: MultipleEntitiesService<Transaction>,
  ) {
    this.currentSelectedItems.set(this.multipleItemsService.selectedItems());
    this.selectedItems.set(this.multipleItemsService.selectedItems());
    this.isSelectedAll.set(this.isSelectedAllItems());
  }

  ngOnInit() {
  }

  onCancel() {
    this._bottomSheetRef.dismiss();
  }

  selectItem(checked: boolean, item: Transaction) {
    if (checked) {
      this.selectedItems.update(selectedItems => [...selectedItems, item]);
    } else {
      this.selectedItems.update((items) => items.filter(i => i.id !== item.id));
    }
    this.isSelectedAll.set(this.isSelectedAllItems());
  }

  selectAllItems(checked: boolean) {
    if (checked) {
      this.selectedItems.update(selectedItems => [...selectedItems, ...this.currentSelectedItems()]);
    } else {
      const itemIds = this.currentSelectedItems().map(item => item.id);
      this.selectedItems.update(selectedItems => selectedItems.filter(selectedItem => !itemIds.includes(selectedItem.id)));
    }
    this.isSelectedAll.set(this.isSelectedAllItems());
  }

  isSelected(item: Transaction) {
    return this.selectedItems().findIndex((i: Transaction) => i.id === item.id) !== -1;
  }

  isSelectedAllItems() {
    return this.currentSelectedItems().every(item => this.isSelected(item));
  }

  onConfirm() {
    this._bottomSheetRef.dismiss({
      selectedItems: this.selectedItems()
    });
  }
}
