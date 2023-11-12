import { Injectable } from '@angular/core';

import { IMenu } from '../_interfaces/imenu';
import {
  PermissionLevelEnum,
  getPermissionLevelEnum,
} from '../_enum/permission-level.enum';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class SidedrawerService {
  mainMenu: IMenu[] = [];
  private _currentUserPermissionLevel: number;
  constructor(private authService: AuthService) {}

  setCurrentUserPrivileges(userPermissionLevel: number) {
    this._currentUserPermissionLevel = userPermissionLevel;
  }

  getMenus() {
    const userPermissionLevel = getPermissionLevelEnum(
      PermissionLevelEnum.User
    );

    const availableMenus = [
      {
        name: 'MAIN_MENU.SALES',
        url: '/sales',
        icon: 'monetization_on',
        minimumPermissionLevel: userPermissionLevel,
      },
      {
        name: 'MAIN_MENU.TOP_PRODUCTS',
        url: '/product-catalogue/top-products',
        icon: 'trending_up',
        minimumPermissionLevel: userPermissionLevel,
      },
      {
        name: 'MAIN_MENU.PRODUCTS_CATALOGUE',
        url: '/product-catalogue/product-list',
        icon: 'add_shopping_cart',
        minimumPermissionLevel: userPermissionLevel,
      },
      {
        name: 'MAIN_MENU.TRANSACTION_HISTORY',
        url: '/transaction-history',
        icon: 'history',
        minimumPermissionLevel: userPermissionLevel,
      },
      {
        name: 'MAIN_MENU.DRAFT_TRANSACTIONS',
        url: '/draft-transactions',
        icon: 'archive',
        minimumPermissionLevel: userPermissionLevel,
      },
      {
        name: 'MAIN_MENU.BARANGAYS',
        url: '/barangays',
        icon: 'place',
        minimumPermissionLevel: userPermissionLevel,
      },
      {
        name: 'MAIN_MENU.REPORTS',
        url: '/reports',
        icon: 'bar_chart',
        minimumPermissionLevel: userPermissionLevel,
      },
      {
        name: 'MAIN_MENU.PROFILE',
        url: '/profile',
        icon: 'person_pin',
      },
      {
        name: 'MAIN_MENU.LOGOUT',
        url: '/logout',
        icon: 'remove_circle_outline',
      },
    ];

    // Filter menu based on the current user permission level on the Retail module.
    // The way in works now, is that if the user has a permission level of 'User', then all the menus will be shown.
    // If the user has a permission level of 'Manager' or 'Administrator', then only Profile menu will be shown.
    // We will later revisit this in the future to properly show menus based on the user's permission level.
    this.mainMenu = availableMenus.filter(
      (m) =>
        !m.minimumPermissionLevel ||
        m.minimumPermissionLevel === this._currentUserPermissionLevel
    );
    return this.mainMenu;
  }
}
