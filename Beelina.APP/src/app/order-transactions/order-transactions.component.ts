import { Component, OnDestroy, OnInit, effect, inject, viewChild } from '@angular/core';
import { Router } from '@angular/router';

import { OrderTransactionDataSource } from '../_models/datasources/order-transactions.datasource';
import { OrderTransactionStore } from './order-transactions.store';
import { BaseComponent } from '../shared/components/base-component/base.component';
import { Transaction } from '../_models/transaction';
import { SearchFieldComponent } from '../shared/ui/search-field/search-field.component';
import { StorageService } from '../_services/storage.service';

@Component({
  selector: 'app-order-transactions',
  templateUrl: './order-transactions.component.html',
  styleUrls: ['./order-transactions.component.scss']
})
export class OrderTransactionsComponent extends BaseComponent implements OnInit, OnDestroy {

  searchFieldComponent = viewChild(SearchFieldComponent);
  dataSource: OrderTransactionDataSource;

  orderTransactionStore = inject(OrderTransactionStore);
  router = inject(Router);
  storageService = inject(StorageService);

  constructor() {
    super();
    this.dataSource = new OrderTransactionDataSource();

    effect(() => {
      this.searchFieldComponent().value(this.orderTransactionStore.filterKeyword());
    });
  }

  ngOnDestroy() {
    this.orderTransactionStore.resetList();
  }

  ngOnInit() {
  }

  onSearch(filterKeyword: string) {
    this.orderTransactionStore.reset();
    this.orderTransactionStore.setSearchSuppliers(filterKeyword);
    this.orderTransactionStore.getOrderTransactions();
  }

  onClear() {
    this.onSearch('');
  }

  viewTransaction(transaction: Transaction) {
    this.storageService.storeString('currentSalesAgentId', transaction.createdById.toString());
    this.router.navigate([`product-catalogue/product-cart/${transaction.id}`], {
      state: {
        dateUpdated: transaction.finalDateUpdatedFormatted,
        updatedBy: transaction.detailsUpdatedBy
      }
    });
  }
}
