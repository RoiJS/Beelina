import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Product } from 'src/app/_models/product';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';

@Component({
  selector: 'app-product-card-item',
  templateUrl: './product-card-item.component.html',
  styleUrls: ['./product-card-item.component.scss'],
})
export class ProductCardItemComponent extends BaseComponent implements OnInit {
  @Input() productItem: Product;
  @Input() allowManageItem: boolean = false;
  @Input() hideHeader: boolean = false;
  @Input() hideImage: boolean = false;
  @Input() hideHeaderOptions: boolean = false;
  @Input() filterKeyword: string = '';
  @Output() editItem = new EventEmitter<number>();
  @Output() deleteItem = new EventEmitter<number>();
  @Output() transferProduct = new EventEmitter<number>();
  @Output() addStockQuantity = new EventEmitter<Product>();
  @Output() selectItem = new EventEmitter<number>();
  @Output() addItem = new EventEmitter<number>();

  constructor() {
    super();
  }

  ngOnInit() { }

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
    this.addStockQuantity.emit(this.productItem);
  }

  addItemToCart(id: number) {
    this.selectItem.emit(id);
  }

  highlightText(text: string) {
    let formattedString = text;

    if (this.filterKeyword.length === 0) return formattedString;
    const keywords = this.filterKeyword.split(' ').filter(k => k.trim().length > 0);

    for (const keyword of keywords) {
      const textIndeces = this.findAllIndicesForMultiWordKeyword(formattedString, keyword);
      if (!textIndeces || textIndeces.length === 0) continue;
      formattedString = this.insertMarkAtIndex(formattedString, textIndeces?.[0]?.startIndex, textIndeces?.[0]?.endIndex);
    }

    return formattedString;
  }
}
