import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { Entity } from '../_models/entity.model';

@Injectable({
  providedIn: 'root'
})
export class MultipleEntitiesService<T extends Entity> {

  isSelectedAll = signal(false);
  selectMultipleActive = signal<boolean>(false);
  selectedItems = signal<T[]>([]);

  translateService = inject(TranslateService);

  activateSelectMultiple(state: boolean) {
    this.selectMultipleActive.set(state);

    if (!state) {
      this.selectedItems.set([]);
      this.isSelectedAll.set(false);
    }
  }

  selectItem(checked: boolean, item: T, items: Array<T>) {
    if (checked) {
      this.selectedItems.update(selectedItems => [...selectedItems, item]);
    } else {
      this.selectedItems.update((items) => items.filter(i => i.id !== item.id));
    }

    this.isSelectedAll.set(this.isSelectedAllItems(items));
  }

  selectAllItems(checked: boolean, items: Array<T>) {
    if (checked) {
      this.selectedItems.update(selectedItems => [...selectedItems, ...items]);
    } else {
      const itemIds = items.map(item => item.id);
      this.selectedItems.update(selectedItems => selectedItems.filter(selectedItem => !itemIds.includes(selectedItem.id)));
    }
    this.isSelectedAll.set(this.isSelectedAllItems(items));
  }

  isSelected(item: T) {
    return this.selectedItems().findIndex((i: T) => i.id === item.id) !== -1;
  }

  selectedItemsCountLabel(textIdentifier: string = 'GENERAL_TEXTS.SELECTED_ITEMS') {
    return `${this.selectedItems().length} ${this.translateService.instant(textIdentifier)}`;
  }


  isSelectedAllItems(items: Array<T>) {
    return items.every(item => this.isSelected(item));
  }

  init(items: Array<T>) {
    this.isSelectedAll.set(this.isSelectedAllItems(items));
  }

  reset() {
    this.isSelectedAll.set(false);
    this.selectMultipleActive.set(false);
    this.selectedItems.set([]);
  }
}
