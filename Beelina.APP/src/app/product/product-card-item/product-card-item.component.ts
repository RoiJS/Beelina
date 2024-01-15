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
  @Output() editItem = new EventEmitter<number>();
  @Output() deleteItem = new EventEmitter<number>();
  @Output() transferProduct = new EventEmitter<number>();
  @Output() addStockQuantity = new EventEmitter<Product>();
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
    this.addItem.emit(id);
  }
}
