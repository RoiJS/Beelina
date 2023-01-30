import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

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
      },
      {
        name: 'MAIN_MENU.ORDERS',
        url: '/order',
      },
      {
        name: 'MAIN_MENU.CUSTOMERS',
        url: '/customer',
      },
      {
        name: 'MAIN_MENU.TOP_PRODUCTS',
        url: '/product/top-products',
      },
      {
        name: 'MAIN_MENU.PRODUCTS',
        url: '/product',
      },
      {
        name: 'MAIN_MENU.LOGOUT',
        url: '/logout',
      },
    ];
  }
}
