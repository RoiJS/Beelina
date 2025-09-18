import { Component, inject, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { TranslateService } from '@ngx-translate/core';

import { CustomerStore } from 'src/app/_models/customer-store';

export interface StoreListBottomSheetData {
  stores: CustomerStore[];
  agentName: string;
  title: string;
  showOrders?: boolean;
}

@Component({
  selector: 'app-store-list-bottom-sheet',
  templateUrl: './store-list-bottom-sheet.component.html',
  styleUrls: ['./store-list-bottom-sheet.component.scss']
})
export class StoreListBottomSheetComponent {

  private _bottomSheetRef = inject(MatBottomSheetRef<StoreListBottomSheetComponent>);
  private _translateService = inject(TranslateService);

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: StoreListBottomSheetData
  ) {}

  onClose() {
    this._bottomSheetRef.dismiss();
  }

  getOrderCountText(orderCount: number): string {
    if (orderCount === 0) {
      return this._translateService.instant('DASHBOARD_ADMIN.DISTRIBUTION_PAGE.SALES_AGENT_DETAILS_SECTION.SALES_INFORMATION_CONTAINER.ORDER_COUNT.=0');
    } else if (orderCount === 1) {
      return this._translateService.instant('DASHBOARD_ADMIN.DISTRIBUTION_PAGE.SALES_AGENT_DETAILS_SECTION.SALES_INFORMATION_CONTAINER.ORDER_COUNT.=1');
    } else {
      return this._translateService.instant('DASHBOARD_ADMIN.DISTRIBUTION_PAGE.SALES_AGENT_DETAILS_SECTION.SALES_INFORMATION_CONTAINER.ORDER_COUNT.other', { count: orderCount });
    }
  }

  getStoreCountText(storeCount: number): string {
    if (storeCount === 0) {
      return this._translateService.instant('DASHBOARD_ADMIN.DISTRIBUTION_PAGE.SALES_AGENT_DETAILS_SECTION.SALES_INFORMATION_CONTAINER.STORE_COUNT.=0');
    } else if (storeCount === 1) {
      return this._translateService.instant('DASHBOARD_ADMIN.DISTRIBUTION_PAGE.SALES_AGENT_DETAILS_SECTION.SALES_INFORMATION_CONTAINER.STORE_COUNT.=1');
    } else {
      return this._translateService.instant('DASHBOARD_ADMIN.DISTRIBUTION_PAGE.SALES_AGENT_DETAILS_SECTION.SALES_INFORMATION_CONTAINER.STORE_COUNT.other', { count: storeCount });
    }
  }

  get stores(): CustomerStore[] {
    return this.data?.stores || [];
  }

  get agentName(): string {
    return this.data?.agentName || '';
  }

  get title(): string {
    return this.data?.title || '';
  }

  get showOrders(): boolean {
    return this.data?.showOrders || false;
  }
}
