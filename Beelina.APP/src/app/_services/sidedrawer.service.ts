import { Injectable } from '@angular/core';

import { IMenu } from '../_interfaces/imenu';

@Injectable({
  providedIn: 'root',
})
export class SidedrawerService {
  mainMenu: IMenu[] = [];
  constructor() {
    this.mainMenu = [
      {
        name: 'MAIN_MENU.SALES',
        url: '/sales',
        icon: 'monetization_on',
      },
      {
        name: 'MAIN_MENU.TOP_PRODUCTS',
        url: '/product-catalogue/top-products',
        icon: 'trending_up',
      },
      {
        name: 'MAIN_MENU.PRODUCTS_CATALOGUE',
        url: '/product-catalogue/product-list',
        icon: 'add_shopping_cart',
      },
      {
        name: 'MAIN_MENU.TRANSACTION_HISTORY',
        url: '/transaction-history',
        icon: 'history',
      },
      {
        name: 'MAIN_MENU.DRAFT_TRANSACTIONS',
        url: '/draft-transactions',
        icon: 'archive',
      },
      {
        name: 'MAIN_MENU.CUSTOMERS',
        url: '/customers/customer-list',
        icon: 'people',
      },
      {
        name: 'MAIN_MENU.LOGOUT',
        url: '/logout',
        icon: 'remove_circle_outline',
      },
    ];
  }
}
