import { Component, inject, OnDestroy, output } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';

import { User } from 'src/app/_models/user.model';
import { CustomerStore } from 'src/app/_models/customer-store';
import { TransactionSalesPerSalesAgent } from 'src/app/_models/sales-per-agent';

import { ProductService } from 'src/app/_services/product.service';
import { UIService } from 'src/app/_services/ui.service';
import { TransactionService } from 'src/app/_services/transaction.service';
import { CustomerStoreService } from 'src/app/_services/customer-store.service';
import { ListShufflerService, ShuffleResult } from 'src/app/_services/list-shuffler.service';
import { DateFilterEnum } from 'src/app/_enum/date-filter.enum';

import { SharedComponent } from 'src/app/shared/components/shared/shared.component';
import { StoreListBottomSheetComponent, StoreListBottomSheetData } from './store-list-bottom-sheet/store-list-bottom-sheet.component';
import { ISalesAgentStoreOrder } from 'src/app/_interfaces/outputs/isales-agent-store-order.output';
import { IStoreOrder } from 'src/app/_interfaces/outputs/istore-order.output';

@Component({
  selector: 'app-sales-agent-list',
  templateUrl: './sales-agent-list.component.html',
  styleUrls: ['./sales-agent-list.component.scss']
})
export class SalesAgentListComponent extends SharedComponent implements OnDestroy {

  selectSalesAgent = output<User>();
  initDefaultSalesAgent = output<User>();

  private _salesAgents: User[];
  private _currentSalesAgent: User;
  protected override _isLoading = true;
  private _productService = inject(ProductService);
  private _transactionService = inject(TransactionService);
  private _customerStoreService = inject(CustomerStoreService);
  private _listShufflerService = inject(ListShufflerService);
  private _bottomSheet = inject(MatBottomSheet);

  // Store data properties
  private _currentFromDate = '';
  private _currentToDate = '';
  private _dateFilter: DateFilterEnum = DateFilterEnum.Daily;
  private _storesWithOrders: ISalesAgentStoreOrder[] = [];
  private _storesWithoutOrders: ISalesAgentStoreOrder[] = [];

  // Sales data properties
  private _currentSalesData: TransactionSalesPerSalesAgent[] = [];

  // Movement tracking helpers
  private _clearMovedTimeoutId?: any;
  private _prevIndexMap = new Map<number, number>();
  private _movedAgents = new Set<number>();
  private _movementDirection = new Map<number, 'up' | 'down'>();

  constructor(protected override uiService: UIService) {
    super(uiService);

    this._productService.getSalesAgentsList().subscribe({
      next: (data: User[]) => {
        this._salesAgents = data;
        this._currentSalesAgent = data[0];
        this._isLoading = false;
        this.initDefaultSalesAgent.emit(this._currentSalesAgent);

        // Initialize index map for movement tracking
        this._prevIndexMap = this._listShufflerService.buildIndexMap(this._salesAgents);
      },
    });
  }

  selectSalesAgentEvent(salesAgent: User) {
    if (this._currentSalesAgent?.id !== salesAgent.id) {
      this._currentSalesAgent = salesAgent;
      this.selectSalesAgent.emit(salesAgent);
    }
  }

  setDateFilter(e: { fromDate: string, toDate: string; dateFilter: DateFilterEnum }) {
    // Update current date range
    this._currentFromDate = e.fromDate;
    this._currentToDate = e.toDate;
    this._dateFilter = e.dateFilter;

    // Reload sales ranking with new date range
    this._loadSalesPerAgent();

    // Reload store data with new date range
    this._loadStoreData();
  }

  trackById(index: number, item: User) {
    return item?.id;
  }

  isMoved(id: number): boolean {
    return this._movedAgents.has(id);
  }

  moveDir(id: number): 'up' | 'down' | null {
    return this._movementDirection.get(id) ?? null;
  }

  private _loadSalesPerAgent() {
    if (!this._currentFromDate || !this._currentToDate) {
      return;
    }

    // Load transaction sales data for ranking
    this._transactionService.getTransactionSalesForAllPerDateRange(this._currentFromDate, this._currentToDate).subscribe({
      next: (data: TransactionSalesPerSalesAgent[]) => {
        this._currentSalesData = data; // Store sales data for lookup
        this._rankAgentsBySales(data);
      },
    });
  }

  private _rankAgentsBySales(salesData: TransactionSalesPerSalesAgent[]) {
    if (!this._salesAgents?.length) return;

    // Create a map of agent ID to sales amount for quick lookup
    const salesMap = new Map<number, number>();
    salesData.forEach(sale => {
      salesMap.set(sale.id, sale.sales);
    });

    // Sort agents by sales amount (highest first), fallback to original order for ties
    const sortFn = (a: User, b: User) => {
      const aSales = salesMap.get(a.id) || 0;
      const bSales = salesMap.get(b.id) || 0;
      return bSales - aSales; // Descending order (highest sales first)
    };

    // Use the shuffler service for movement tracking
    const sortResult: ShuffleResult<User> = this._listShufflerService.sortWithMovementTracking(
      this._salesAgents,
      sortFn,
      this._prevIndexMap,
      false
    );

    // Apply the sort result
    this._salesAgents = sortResult.shuffledItems;
    this._movedAgents = sortResult.movedItems;
    this._movementDirection = sortResult.movementDirections;
    this._prevIndexMap = this._listShufflerService.buildIndexMap(this._salesAgents);

    // Clear highlight after animation completes (considering staggered delays)
    const maxDelay = this._salesAgents.length * 100; // 100ms delay per item
    const animationDuration = 1000; // 1000ms animation duration
    const totalTime = maxDelay + animationDuration;

    if (this._clearMovedTimeoutId) clearTimeout(this._clearMovedTimeoutId);
    this._clearMovedTimeoutId = setTimeout(() => {
      this._movedAgents.clear();
      this._movementDirection.clear();
    }, totalTime + 400); // Extra 400ms buffer
  }

  private _loadStoreData() {
    if (!this._salesAgents?.length || !this._currentFromDate || !this._currentToDate) {
      return;
    }

    const salesAgentIds = this._salesAgents.map(agent => agent.id);

    // Load stores with orders
    this._customerStoreService.getSalesAgentStoreWithOrders(
      salesAgentIds,
      this._currentFromDate,
      this._currentToDate
    ).subscribe({
      next: (data: ISalesAgentStoreOrder[]) => {
        this._storesWithOrders = data;
      },
      error: (error) => {
        console.error('Error loading stores with orders:', error);
      }
    });

    // Load stores without orders (based on previous period analysis)
    this._customerStoreService.getSalesAgentStoreWithoutOrders(
      salesAgentIds,
      this._dateFilter,
      this._currentFromDate,
      this._currentToDate
    ).subscribe({
      next: (data: ISalesAgentStoreOrder[]) => {
        this._storesWithoutOrders = data;
      },
      error: (error) => {
        console.error('Error loading stores without orders:', error);
      }
    });
  }

  get salesAgents(): User[] {
    return this._salesAgents;
  }

  get currentSalesAgent(): number {
    return this._currentSalesAgent?.id;
  }

  get storesWithOrders(): ISalesAgentStoreOrder[] {
    return this._storesWithOrders;
  }

  get storesWithoutOrders(): ISalesAgentStoreOrder[] {
    return this._storesWithoutOrders;
  }

  // Method to get sales amount for a specific sales agent
  getSalesAmountForAgent(agentId: number): number {
    const salesData = this._currentSalesData.find(s => s.id === agentId);
    return salesData?.sales || 0;
  }

  // Method to get formatted sales amount for a specific sales agent
  getFormattedSalesAmountForAgent(agentId: number): string {
    const salesData = this._currentSalesData.find(s => s.id === agentId);
    return salesData?.salesFormatted || '₱0.00';
  }

  // Method to get stores with orders count for a specific sales agent
  getStoresWithOrdersCount(agentId: number): number {
    const agentStoreData = this._storesWithOrders.find(s => s.salesAgentId === agentId);
    return agentStoreData?.storeOrders?.length || 0;
  }

  // Method to get stores without orders count for a specific sales agent
  getStoresWithoutOrdersCount(agentId: number): number {
    const agentStoreData = this._storesWithoutOrders.find(s => s.salesAgentId === agentId);
    return agentStoreData?.storeOrders?.length || 0;
  }

  // Method to show stores with orders in bottom sheet
  showStoresWithOrders(agentId: number, event: Event) {
    event.stopPropagation(); // Prevent triggering the row click

    const agent = this._salesAgents.find(a => a.id === agentId);
    const agentStoreData = this._storesWithOrders.find(s => s.salesAgentId === agentId);
    const stores = this._mapStoreOrdersToCustomerStores(agentStoreData?.storeOrders || []);

    const data: StoreListBottomSheetData = {
      stores: stores,
      agentName: agent?.fullname || '',
      title: 'Stores with Orders',
      showOrders: true
    };

    this._bottomSheet.open(StoreListBottomSheetComponent, {
      data: data,
      panelClass: 'store-list-bottom-sheet',
      disableClose: false
    });
  }

  // Method to show stores without orders in bottom sheet
  showStoresWithoutOrders(agentId: number, event: Event) {
    event.stopPropagation(); // Prevent triggering the row click

    const agent = this._salesAgents.find(a => a.id === agentId);
    const agentStoreData = this._storesWithoutOrders.find(s => s.salesAgentId === agentId);
    const stores = this._mapStoreOrdersToCustomerStores(agentStoreData?.storeOrders || []);

    const data: StoreListBottomSheetData = {
      stores: stores,
      agentName: agent?.fullname || '',
      title: 'Stores without Orders',
      showOrders: false
    };

    this._bottomSheet.open(StoreListBottomSheetComponent, {
      data: data,
      panelClass: 'store-list-bottom-sheet',
      disableClose: false
    });
  }

  // Helper method to map IStoreOrder to CustomerStore
  private _mapStoreOrdersToCustomerStores(storeOrders: IStoreOrder[]): CustomerStore[] {
    return storeOrders.map(storeOrder => {
      const customerStore = new CustomerStore();
      customerStore.id = storeOrder.storeId;
      customerStore.name = storeOrder.name;
      customerStore.address = storeOrder.barangayName;
      return customerStore;
    });
  }

  override get isLoading(): boolean {
    return this._isLoading;
  }

  override ngOnDestroy(): void {
    if (this._clearMovedTimeoutId) clearTimeout(this._clearMovedTimeoutId);
  }
}
