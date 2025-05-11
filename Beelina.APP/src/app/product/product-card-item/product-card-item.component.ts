import { Component, input, output } from '@angular/core';

import { Product } from 'src/app/_models/product';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';

@Component({
  selector: 'app-product-card-item',
  templateUrl: './product-card-item.component.html',
  styleUrls: ['./product-card-item.component.scss'],
})
export class ProductCardItemComponent extends BaseComponent {
  productItem = input<Product>();
  allowManageItem = input<boolean>(false);
  allowTransferStocks = input<boolean>(true);
  hideHeader = input<boolean>(false);
  hideImage = input<boolean>(false);
  hideHeaderOptions = input<boolean>(false);
  hideDeductionCounterIcon = input<boolean>(false);
  filterKeyword = input<string>('');

  editItem = output<number>();
  deleteItem = output<number>();
  transferProduct = output<number>();
  addStockQuantity = output<Product>();
  selectItem = output<number>();
  addItem = output<number>();

  constructor() {
    super();
  }

  editProduct(id: number) {
    this.editItem.emit(id);
  }

  deleteProduct(id: number) {
    this.deleteItem.emit(id);
  }

  transferProductInventory(id: number) {
    this.transferProduct.emit(id);
  }

  addProductStockQuantity() {
    this.addStockQuantity.emit(this.productItem());
  }

  addItemToCart(id: number) {
    this.selectItem.emit(id);
  }

  highlightText(text: string) {
    let formattedString = text;

    if (this.filterKeyword().length === 0) return formattedString;
    const keywords = this.filterKeyword().split(' ').filter(k => k.trim().length > 0);

    for (const keyword of keywords) {
      const textIndeces = this.findAllIndicesForMultiWordKeyword(formattedString, keyword);
      if (!textIndeces || textIndeces.length === 0) continue;
      formattedString = this.insertMarkAtIndex(formattedString, textIndeces?.[0]?.startIndex, textIndeces?.[0]?.endIndex);
    }

    return formattedString;
  }
}
