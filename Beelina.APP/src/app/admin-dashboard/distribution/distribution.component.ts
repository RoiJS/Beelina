import { Component, inject, OnInit, viewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { User } from 'src/app/_models/user.model';
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';

import { SalesInformationComponent } from './sales-information/sales-information.component';
import { ProductListComponent } from './product-list/product-list.component';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { ProductStockAuditComponent } from './product-stock-audit/product-stock-audit.component';
import { SalesAgentListComponent } from './sales-agent-list/sales-agent-list.component';
import { SalesTargetManagementComponent } from './sales-target-management/sales-target-management.component';

@Component({
  selector: 'app-distribution',
  templateUrl: './distribution.component.html',
  styleUrls: ['./distribution.component.scss']
})
export class DistributionComponent extends BaseComponent {

  salesAgentListComponent = viewChild(SalesAgentListComponent);
  salesInformationComponent = viewChild(SalesInformationComponent);
  productListComponent = viewChild(ProductListComponent);
  productStockAuditComponent = viewChild(ProductStockAuditComponent);
  salesTargetManagementComponent = viewChild(SalesTargetManagementComponent);

  salesChartViewLoading: boolean;

  currentSalesAgent: User;
  private storageService = inject(StorageService);
  private translateService = inject(TranslateService);
  private authService = inject(AuthService)

  constructor() {
    super();
    this._currentLoggedInUser = this.authService.user.value;
  }


  dateFilterChange(e: { fromDate: string, toDate: string, dateFilter: number }) {
    this.salesAgentListComponent().setDateFilter(e);
  }

  initDefaultSalesAgent(user: User) {
    this.currentSalesAgent = user;
    this.storeCurrentSalesAgentId();
    this.salesInformationComponent().calculateTotalSales(user);
    this.productListComponent().initProductList();
  }

  storeCurrentSalesAgentId() {
    this.storageService.storeString(
      'currentSalesAgentId',
      this.currentSalesAgent.id.toString()
    );
  }

  showDetailsForSalesAgent(user: User) {
    this.currentSalesAgent = user;
    this.storeCurrentSalesAgentId();
    this.salesInformationComponent().calculateTotalSales(user);
    this.productListComponent().initProductList();
    this.productStockAuditComponent().resetStockAuditList();
  }

  showStockAudit(id: number) {
    this.productStockAuditComponent().initStockAuditList(id, this.currentSalesAgent.id);
  }

  get salesAgentDetails(): string {
    const salesAgentName = this.currentSalesAgent?.fullname;
    const label = `${this.translateService.instant('DASHBOARD_ADMIN.DISTRIBUTION_PAGE.SALES_AGENT_DETAILS_SECTION.TITLE')} - ${salesAgentName}`;
    return label;
  }
}
