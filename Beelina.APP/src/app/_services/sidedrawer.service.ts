import { inject, Injectable } from '@angular/core';

import { IMenu } from '../_interfaces/imenu';
import {
  PermissionLevelEnum,
  getPermissionLevelEnum,
} from '../_enum/permission-level.enum';
import { NetworkService } from './network.service';
import { ClientSubscriptionDetails } from '../_models/client-subscription-details.model';
import { LocalClientSubscriptionDbService } from './local-db/local-client-subscription-db.service';
import { BusinessModelEnum } from '../_enum/business-model.enum';

@Injectable({
  providedIn: 'root',
})
export class SidedrawerService {
  mainMenu: IMenu[] = [];
  clientSubscriptionDetails: ClientSubscriptionDetails;

  private _currentUserPermissionLevel: number;
  private _currentBusinessModel: BusinessModelEnum;
  private _networkService = inject(NetworkService);
  private _localClientSubscriptionDbService = inject(LocalClientSubscriptionDbService);

  constructor() {
    (async () => {
      this.clientSubscriptionDetails = await this._localClientSubscriptionDbService.getLocalClientSubsription();
    })();
  }

  setCurrentUserPrivileges(userPermissionLevel: number) {
    this._currentUserPermissionLevel = userPermissionLevel;
  }

  setBusinessModel(businessModel: BusinessModelEnum) {
    this._currentBusinessModel = businessModel;
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
        supportOffline: false,
        visible: true,
      },
      {
        name: 'MAIN_MENU.TOP_PRODUCTS',
        url: '/product-catalogue/top-products',
        icon: 'trending_up',
        minimumPermissionLevel: userPermissionLevel,
        maximumPermissionLevel: userPermissionLevel,
        supportOffline: false,
        visible: this.clientSubscriptionDetails?.topProductsPageActive,
      },
      {
        name: 'MAIN_MENU.PRODUCTS_CATALOGUE',
        url: '/product-catalogue/product-list',
        icon: 'add_shopping_cart',
        minimumPermissionLevel: userPermissionLevel,
        maximumPermissionLevel: managerPermissionLevel,
        supportOffline: true,
        visible: true,
      },
      {
        name: 'MAIN_MENU.DRAFT_ORDERS',
        url: '/draft-transactions',
        icon: 'archive',
        minimumPermissionLevel: userPermissionLevel,
        maximumPermissionLevel: userPermissionLevel,
        supportOffline: true,
        visible: true,
      },
      {
        name: 'MAIN_MENU.CONFIRMED_ORDERS',
        url: '/transaction-history',
        icon: 'check_circle_outline',
        minimumPermissionLevel: userPermissionLevel,
        maximumPermissionLevel: userPermissionLevel,
        supportOffline: false,
        visible: true,
      },
      {
        name: 'MAIN_MENU.BAD_ORDERS',
        url: '/bad-orders',
        icon: 'remove_shopping_cart',
        minimumPermissionLevel: userPermissionLevel,
        maximumPermissionLevel: userPermissionLevel,
        supportOffline: true,
        visible: true,
      },
      {
        name: 'MAIN_MENU.CUSTOMER_ACCOUNTS',
        url: '/customer-accounts',
        icon: 'place',
        minimumPermissionLevel: userPermissionLevel,
        maximumPermissionLevel: userPermissionLevel,
        supportOffline: false,
        visible: true,
      },
      {
        name: 'MAIN_MENU.DASHBOARD',
        url: '/dashboard',
        icon: 'bar_chart',
        minimumPermissionLevel: administratorPermissionLevel,
        maximumPermissionLevel: administratorPermissionLevel,
        supportOffline: false,
        visible: true,
      },
      {
        name: 'MAIN_MENU.WAREHOUSE_PRODUCTS',
        url: '/warehouse-products',
        icon: 'add_shopping_cart',
        minimumPermissionLevel: administratorPermissionLevel,
        maximumPermissionLevel: administratorPermissionLevel,
        supportOffline: false,
        visible: true,
      },
      {
        name: 'MAIN_MENU.PURCHASE_ORDERS',
        url: '/purchase-orders',
        icon: 'description',
        minimumPermissionLevel: managerPermissionLevel,
        maximumPermissionLevel: administratorPermissionLevel,
        supportOffline: false,
        visible: true,
      },
      {
        name: 'MAIN_MENU.PRODUCT_WITHDRAWALS',
        url: '/product-withdrawals',
        icon: 'description',
        minimumPermissionLevel: managerPermissionLevel,
        maximumPermissionLevel: managerPermissionLevel,
        supportOffline: false,
        visible: this._currentBusinessModel !== BusinessModelEnum.WarehouseMonitoring,
      },
      {
        name: 'MAIN_MENU.ORDER_TRANSACTIONS',
        url: '/order-transactions',
        icon: 'assignment',
        minimumPermissionLevel: administratorPermissionLevel,
        maximumPermissionLevel: administratorPermissionLevel,
        supportOffline: false,
        visible: true,
      },
      {
        name: 'MAIN_MENU.SUPPLIERS',
        url: '/suppliers',
        icon: 'local_mall',
        minimumPermissionLevel: administratorPermissionLevel,
        maximumPermissionLevel: administratorPermissionLevel,
        supportOffline: false,
        visible: true,
      },
      {
        name: 'MAIN_MENU.ACCOUNTS',
        url: '/accounts',
        icon: 'person_pin',
        minimumPermissionLevel: administratorPermissionLevel,
        maximumPermissionLevel: administratorPermissionLevel,
        supportOffline: false,
        visible: true,
      },
      {
        name: 'MAIN_MENU.REPORTS',
        url: '/reports',
        icon: 'bar_chart',
        minimumPermissionLevel: userPermissionLevel,
        maximumPermissionLevel: administratorPermissionLevel,
        supportOffline: false,
        visible: true,
      },
      {
        name: 'MAIN_MENU.SETTINGS',
        url: '/settings',
        icon: 'settings',
        minimumPermissionLevel: userPermissionLevel,
        maximumPermissionLevel: userPermissionLevel,
        supportOffline: true,
        visible: true,
      },
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
        supportOffline: true,
        visible: true,
      },
    ];

    // Filter menu based on the current user permission level on the Distribution module.
    // The way it works now, is that if the user has a permission level of 'User' or 'Administrator', then all the menus will be shown.
    // If the user has a permission level of 'Manager', then only Profile menu will be shown.
    // We will later revisit this in the future to properly show menus based on the user's permission level.
    // Done: We are now showing the correct menus based on the user's permission level.
    this.mainMenu = availableMenus.filter(
      (m) =>
        (!m.minimumPermissionLevel && !m.maximumPermissionLevel) ||
        m.minimumPermissionLevel <= this._currentUserPermissionLevel &&
        m.maximumPermissionLevel >= this._currentUserPermissionLevel
    );

    // Filter based on visible attribute.
    this.mainMenu = this.mainMenu.filter(m => m.visible);

    // Filter menu based on the online/offline support
    if (!this._networkService.isOnline.value) {
      this.mainMenu = this.mainMenu.filter((m) => m.supportOffline);
    }

    return this.mainMenu;
  }
}
