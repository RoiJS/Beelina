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
  @Output() editItem = new EventEmitter<number>();
  @Output() deleteItem = new EventEmitter<number>();
  @Output() addItem = new EventEmitter<number>();

  constructor() {
    super();
  }

  ngOnInit() {}

  editProduct(id: number) {
    this.editItem.emit(id);
  }

  deleteProduct(id: number) {
    this.deleteItem.emit(id);
  }

  addItemToCart(id: number) {
    this.addItem.emit(id);
  }
}
