import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, Subscription, startWith, debounceTime, distinctUntilChanged, switchMap, tap, of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { BaseControlComponent } from '../base-control/base-control.component';
import { CustomerStore } from 'src/app/_models/customer-store';
import { CustomerStoreService } from 'src/app/_services/customer-store.service';

@Component({
  selector: 'app-customer-dropdown-control',
  templateUrl: './customer-dropdown-control.component.html',
  styleUrls: ['./customer-dropdown-control.component.scss']
})
export class CustomerDropdownControlComponent extends BaseControlComponent implements OnInit, OnDestroy {

  private _customerStoreService: CustomerStoreService;
  private _subscription: Subscription = new Subscription();
  private _customersLoaded: boolean = false;
  private _allCustomers: Array<CustomerStore> = [];

  customerControl = new FormControl();
  filteredCustomers: Observable<Array<CustomerStore>>;
  selectedCustomer: CustomerStore;

  constructor(
    customerStoreService: CustomerStoreService,
    protected override translateService: TranslateService
  ) {
    super(translateService);
    this._customerStoreService = customerStoreService;
  }

  override ngOnInit() {
    // Load all customers once at initialization
    this._loadAllCustomers();

    this.filteredCustomers = this.customerControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      tap((value: string | CustomerStore) => {
        // Handle selection state and notify value changes
        if (typeof value === 'object' && value !== null) {
          this.selectedCustomer = value;
          this._notifyValueChange(value.id);
        } else if (typeof value === 'string') {
          this.selectedCustomer = null;
          this._notifyValueChange(null);
        }
      }),
      switchMap((value: string | CustomerStore) => {
        if (typeof value === 'string') {
          return this._filterCustomersFromCache(value);
        } else {
          return of([]);
        }
      })
    );

    // Set initial value if provided
    const initialValue = this.value();
    if (initialValue && typeof initialValue === 'number') {
      this._loadInitialCustomer(initialValue);
    }
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  override value(value: any = null): any {
    if (value !== null && value !== undefined) {
      // Setting value
      this._loadInitialCustomer(value);
      return value;
    } else {
      // Getting value
      return this.selectedCustomer ? this.selectedCustomer.id.toString() : null;
    }
  }

  private _notifyValueChange(value: any): void {
    // This will be used to notify parent components of value changes
    // The base class doesn't have onValueChange, so we'll implement our own mechanism
  }

  private _loadAllCustomers(): void {
    if (!this._customersLoaded) {
      this._subscription.add(
        this._customerStoreService.getAllCustomerStores().subscribe(customers => {
          if (customers) {
            this._allCustomers = customers;
            this._customersLoaded = true;
          }
        })
      );
    }
  }

  private _filterCustomersFromCache(value: string): Observable<Array<CustomerStore>> {
    if (!value || value.length < 2) {
      return of([]);
    }

    if (!this._customersLoaded) {
      return of([]);
    }

    const filteredCustomers = this._allCustomers.filter(customer =>
      customer.name && customer.name.toLowerCase().includes(value.toLowerCase()) ||
      customer.address && customer.address.toLowerCase().includes(value.toLowerCase()) ||
      customer.barangay && customer.barangay.name && customer.barangay.name.toLowerCase().includes(value.toLowerCase())
    );

    return of(filteredCustomers);
  }

  private _loadInitialCustomer(customerId: number): void {
    // Check service cache first before making API call
    const cachedCustomers = this._customerStoreService.cachedCustomers;
    if (cachedCustomers && cachedCustomers.length > 0) {
      this._allCustomers = [...cachedCustomers];
      this._customersLoaded = true;
      const customer = cachedCustomers.find(c => c.id === customerId);
      if (customer) {
        this.selectedCustomer = customer;
        this.customerControl.setValue(customer);
      }
    } else {
      // If customers are already loaded, use cache
      if (this._customersLoaded) {
        const customer = this._allCustomers.find(c => c.id === customerId);
        if (customer) {
          this.selectedCustomer = customer;
          this.customerControl.setValue(customer);
        }
      } else {
        // If customers not loaded yet, load them first
        this._subscription.add(
          this._customerStoreService.getAllCustomerStores().subscribe(customers => {
            if (customers) {
              this._allCustomers = customers;
              this._customersLoaded = true;
              const customer = customers.find(c => c.id === customerId);
              if (customer) {
                this.selectedCustomer = customer;
                this.customerControl.setValue(customer);
              }
            }
          })
        );
      }
    }
  }

  displayCustomer(customer: CustomerStore): string {
    return customer ? `${customer.name} - ${customer.barangay?.name || ''}` : '';
  }

  onCustomerSelected(customer: CustomerStore): void {
    this.selectedCustomer = customer;
    this._notifyValueChange(customer.id);
  }

  clearSelection(): void {
    this.customerControl.setValue('');
    this.selectedCustomer = null;
    this._notifyValueChange(null);
  }
}
