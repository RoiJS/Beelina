import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class MultipleItemsService {

  isSelectedAll = signal(false);
  selectMultipleActive = signal<boolean>(false);
  selectedItems = signal<string[]>([]);

  translateService = inject(TranslateService);

  activateSelectMultiple(state: boolean) {
    this.selectMultipleActive.set(state);

    if (!state) {
      this.selectedItems.set([]);
      this.isSelectedAll.set(false);
    }
  }

  selectItem(checked: boolean, id: string, itemsCount: number) {
    if (checked) {
      this.selectedItems().push(id);
    } else {
      this.selectedItems().splice(this.selectedItems().indexOf(id), 1);
    }

    this.isSelectedAll.set(this.selectedItems().length === itemsCount);
  }

  selectAllItems(checked: boolean, items: Array<string>) {
    this.selectedItems.set([]);
    if (checked) {
      this.selectedItems.set([...items]);
    }
    this.isSelectedAll.set(this.selectedItems().length === items.length);
  }

  isSelected(id: string) {
    return this.selectedItems().findIndex((i) => i === id) !== -1;
  }

  selectedItemsCountLabel(textIdentifier: string = 'GENERAL_TEXTS.SELECTED_ITEMS') {
    return `${this.selectedItems().length} ${this.translateService.instant(textIdentifier)}`;
  }

  reset() {
    this.isSelectedAll.set(false);
    this.selectMultipleActive.set(false);
    this.selectedItems.set([]);
  }
}
