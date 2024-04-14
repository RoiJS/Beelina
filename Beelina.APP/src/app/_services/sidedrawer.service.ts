import { Injectable } from '@angular/core';

import { IMenu } from '../_interfaces/imenu';
import {
  PermissionLevelEnum,
  getPermissionLevelEnum,
} from '../_enum/permission-level.enum';

@Injectable({
  providedIn: 'root',
})
export class SidedrawerService {
  mainMenu: IMenu[] = [];
  private _currentUserPermissionLevel: number;
  constructor() { }

  setCurrentUserPrivileges(userPermissionLevel: number) {
    this._currentUserPermissionLevel = userPermissionLevel;
  }

  getMenus() {
    const userPermissionLevel = getPermissionLevelEnum(
      PermissionLevelEnum.User
    );

    const administratorPermissionLevel = getPermissionLevelEnum(
      PermissionLevelEnum.Administrator
    );

    const managerPermissionLevel = getPermissionLevelEnum(
      PermissionLevelEnum.Manager
    );

    const availableMenus = [
      {
        name: 'MAIN_MENU.SALES',
        url: '/sales',
        icon: 'monetization_on',
        minimumPermissionLevel: userPermissionLevel,
        maximumPermissionLevel: userPermissionLevel,
      },
      {
        name: 'MAIN_MENU.TOP_PRODUCTS',
        url: '/product-catalogue/top-products',
        icon: 'trending_up',
        minimumPermissionLevel: userPermissionLevel,
        maximumPermissionLevel: userPermissionLevel,
      },
      {
        name: 'MAIN_MENU.PRODUCTS_CATALOGUE',
        url: '/product-catalogue/product-list',
        icon: 'add_shopping_cart',
        minimumPermissionLevel: userPermissionLevel,
        maximumPermissionLevel: managerPermissionLevel,
      },
      {
        name: 'MAIN_MENU.DRAFT_ORDERS',
        url: '/draft-transactions',
        icon: 'archive',
        minimumPermissionLevel: userPermissionLevel,
        maximumPermissionLevel: userPermissionLevel,
      },
      {
        name: 'MAIN_MENU.CONFIRMED_ORDERS',
        url: '/transaction-history',
        icon: 'check_circle_outline',
        minimumPermissionLevel: userPermissionLevel,
        maximumPermissionLevel: userPermissionLevel,
      },
      {
        name: 'MAIN_MENU.BAD_ORDERS',
        url: '/bad-orders',
        icon: 'remove_shopping_cart',
        minimumPermissionLevel: userPermissionLevel,
        maximumPermissionLevel: userPermissionLevel,
      },
      {
        name: 'MAIN_MENU.CUSTOMERS',
        url: '/barangays',
        icon: 'place',
        minimumPermissionLevel: userPermissionLevel,
        maximumPermissionLevel: userPermissionLevel,
      },
      {
        name: 'MAIN_MENU.DASHBOARD',
        url: '/dashboard',
        icon: 'bar_chart',
        minimumPermissionLevel: administratorPermissionLevel,
        maximumPermissionLevel: administratorPermissionLevel,
      },
      {
        name: 'MAIN_MENU.WAREHOUSE_PRODUCTS',
        url: '/warehouse-products',
        icon: 'add_shopping_cart',
        minimumPermissionLevel: administratorPermissionLevel,
        maximumPermissionLevel: administratorPermissionLevel,
      },
      {
        name: 'MAIN_MENU.REPORTS',
        url: '/reports',
        icon: 'bar_chart',
        minimumPermissionLevel: userPermissionLevel,
        maximumPermissionLevel: administratorPermissionLevel,
      },
      // {
      //   name: 'MAIN_MENU.ACCOUNTS',
      //   url: '/accounts',
      //   icon: 'person_pin',
      //   minimumPermissionLevel: administratorPermissionLevel,
      //   maximumPermissionLevel: administratorPermissionLevel,
      // },
      // {
      //   name: 'MAIN_MENU.MANUAL',
      //   url: 'https://bizual-assets.s3.ap-southeast-1.amazonaws.com/files/Bizual-User-Manual.pdf',
      //   icon: 'error_outline',
      //   isExternalUrl: true,
      //   minimumPermissionLevel: userPermissionLevel,
      //   maximumPermissionLevel: managerPermissionLevel,
      // },
      {
        name: 'MAIN_MENU.LOGOUT',
        url: '/logout',
        icon: 'remove_circle_outline',
      },
    ];

    // Filter menu based on the current user permission level on the Retail module.
    // The way in works now, is that if the user has a permission level of 'User' or 'Administrator', then all the menus will be shown.
    // If the user has a permission level of 'Manager', then only Profile menu will be shown.
    // We will later revisit this in the future to properly show menus based on the user's permission level.
    // Done: We are now showing the correct menus based on the user's permission level.
    this.mainMenu = availableMenus.filter(
      (m) =>
        (!m.minimumPermissionLevel && !m.maximumPermissionLevel) ||
        m.minimumPermissionLevel <= this._currentUserPermissionLevel &&
        m.maximumPermissionLevel >= this._currentUserPermissionLevel
    );
    return this.mainMenu;
  }
}
