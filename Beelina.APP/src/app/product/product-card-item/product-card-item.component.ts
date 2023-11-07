import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Product } from 'src/app/_models/product';

@Component({
  selector: 'app-product-card-item',
  templateUrl: './product-card-item.component.html',
  styleUrls: ['./product-card-item.component.scss'],
})
export class ProductCardItemComponent implements OnInit {
  @Input() productItem: Product;
  @Input() allowManageItem: boolean = false;
  @Output() editItem = new EventEmitter<number>();
  @Output() deleteItem = new EventEmitter<number>();
  @Output() addItem = new EventEmitter<number>();

  constructor() {}

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

  getProductPhoto(name: string) {
    const products = [
      {
        name: 'Absolute Drinking Water',
        url: '../../../assets/products/AbsoluteDrinkingWater.jpg',
      },
      {
        name: 'Datu Puti Vinegar',
        url: '../../../assets/products/DatuPutiVinegar.jpg',
      },
      {
        name: 'Lucky Me Chicken Noodles',
        url: '../../../assets/products/LuckyMeChickenNoodles.jpg',
      },
      {
        name: 'Mega Sardines Green',
        url: '../../../assets/products/MegaSardinesGreen.jpg',
      },
      {
        name: 'Mega Sardines Red',
        url: '../../../assets/products/MegaSardinesRed.jpg',
      },
      {
        name: 'Piattos',
        url: '../../../assets/products/Piattos.jpg',
      },
    ];

    const photo =
      products.find((p) => p.name === name)?.url ||
      '../../assets/icons/box-product.png';

    return photo;
  }
}
