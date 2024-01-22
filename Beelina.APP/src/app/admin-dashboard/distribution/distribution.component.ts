import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';

import { User } from 'src/app/_models/user.model';
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';

import { SalesInformationComponent } from './sales-information/sales-information.component';
import { ProductListComponent } from './product-list/product-list.component';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { ProductStockAuditComponent } from './product-stock-audit/product-stock-audit.component';

@Component({
  selector: 'app-distribution',
  templateUrl: './distribution.component.html',
  styleUrls: ['./distribution.component.scss']
})
export class DistributionComponent extends BaseComponent implements OnInit {

  @ViewChild(SalesInformationComponent) salesInformationComponent: SalesInformationComponent;
  @ViewChild(ProductListComponent) productListComponent: ProductListComponent;
  @ViewChild(ProductStockAuditComponent) productStockAuditComponent: ProductStockAuditComponent;

  private _currentSalesAgent: User;

  constructor(
    private storageService: StorageService,
    private translateService: TranslateService,
    private authService: AuthService) {
    super();
    this._currentLoggedInUser = this.authService.user.value;
  }

  ngOnInit() {
  }

  initDefaultSalesAgent(user: User) {
    this._currentSalesAgent = user;
    this.storeCurrentSalesAgentId();
    this.salesInformationComponent.calculateTotalSales(user);
    this.productListComponent.initProductList();
  }

  storeCurrentSalesAgentId() {
    this.storageService.storeString(
      'currentSalesAgentId',
      this._currentSalesAgent.id.toString()
    );
  }

  showDetailsForSalesAgent(user: User) {
    this._currentSalesAgent = user;
    this.storeCurrentSalesAgentId();
    this.salesInformationComponent.calculateTotalSales(user);
    this.productListComponent.initProductList();
    this.productStockAuditComponent.resetStockAuditList();
  }

  showStockAudit(id: number) {
    this.productStockAuditComponent.initStockAuditList(id, this._currentSalesAgent.id);
  }

  get salesAgentDetails(): string {
    const salesAgentName = this._currentSalesAgent?.fullname;
    const label = `${this.translateService.instant('DASHBOARD_ADMIN.DISTRIBUTION_PAGE.SALES_AGENT_DETAILS_SECTION.TITLE')} - ${salesAgentName}`;
    return label;
  }
}
