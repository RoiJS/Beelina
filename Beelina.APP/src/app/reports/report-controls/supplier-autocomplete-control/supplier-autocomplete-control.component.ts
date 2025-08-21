import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, Subscription, startWith, debounceTime, distinctUntilChanged, switchMap, tap, of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { SupplierService } from 'src/app/_services/supplier.service';
import { BaseControlComponent } from '../base-control/base-control.component';
import { Supplier } from 'src/app/_models/supplier';

@Component({
  selector: 'app-supplier-autocomplete-control',
  templateUrl: './supplier-autocomplete-control.component.html',
  styleUrls: ['./supplier-autocomplete-control.component.scss']
})
export class SupplierAutocompleteControlComponent extends BaseControlComponent implements OnInit, OnDestroy {

  private _supplierService: SupplierService;
  private _subscription: Subscription = new Subscription();
  private _suppliersLoaded: boolean = false;
  private _allSuppliers: Array<Supplier> = [];

  supplierControl = new FormControl();
  filteredSuppliers: Observable<Array<Supplier>>;
  selectedSupplier: Supplier;

  constructor(
    supplierService: SupplierService,
    protected override translateService: TranslateService
  ) {
    super(translateService);
    this._supplierService = supplierService;
  }

  override ngOnInit() {
    // Load all suppliers once at initialization
    this._loadAllSuppliers();

    this.filteredSuppliers = this.supplierControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      tap((value: string | Supplier) => {
        // Handle selection state and notify value changes
        if (typeof value === 'object' && value !== null) {
          this.selectedSupplier = value;
          this._notifyValueChange(value.id);
        } else if (typeof value === 'string') {
          this.selectedSupplier = null;
          this._notifyValueChange(null);
        }
      }),
      switchMap((value: string | Supplier) => {
        if (typeof value === 'string') {
          return this._filterSuppliersFromCache(value);
        } else {
          return of([]);
        }
      })
    );

    // Set initial value if provided
    const initialValue = this.value();
    if (initialValue && typeof initialValue === 'number') {
      this._loadInitialSupplier(initialValue);
    }
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  override value(value: any = null): any {
    if (value !== null && value !== undefined) {
      // Setting value
      this._loadInitialSupplier(value);
      return value;
    } else {
      // Getting value
      return this.selectedSupplier ? this.selectedSupplier.id.toString() : null;
    }
  }

  private _notifyValueChange(value: any): void {
    // This will be used to notify parent components of value changes
    // The base class doesn't have onValueChange, so we'll implement our own mechanism
  }

  private _loadAllSuppliers(): void {
    if (!this._suppliersLoaded) {
      this._subscription.add(
        this._supplierService.getAllSuppliers().subscribe(suppliers => {
          if (suppliers) {
            this._allSuppliers = suppliers;
            this._suppliersLoaded = true;
          }
        })
      );
    }
  }

  private _filterSuppliersFromCache(value: string): Observable<Array<Supplier>> {
    if (!value || value.length < 2) {
      return of([]);
    }

    if (!this._suppliersLoaded) {
      return of([]);
    }

    const filteredSuppliers = this._allSuppliers.filter(supplier =>
      supplier.name && supplier.name.toLowerCase().includes(value.toLowerCase()) ||
      supplier.code && supplier.code.toLowerCase().includes(value.toLowerCase())
    );

    return of(filteredSuppliers);
  }

  private _loadInitialSupplier(supplierId: number): void {
    // If suppliers are already loaded, use cache
    if (this._suppliersLoaded) {
      const supplier = this._allSuppliers.find(s => s.id === supplierId);
      if (supplier) {
        this.selectedSupplier = supplier;
        this.supplierControl.setValue(supplier);
      }
    } else {
      // If suppliers not loaded yet, load them first
      this._subscription.add(
        this._supplierService.getAllSuppliers().subscribe(suppliers => {
          if (suppliers) {
            this._allSuppliers = suppliers;
            this._suppliersLoaded = true;
            const supplier = suppliers.find(s => s.id === supplierId);
            if (supplier) {
              this.selectedSupplier = supplier;
              this.supplierControl.setValue(supplier);
            }
          }
        })
      );
    }
  }

  displaySupplier(supplier: Supplier): string {
    return supplier ? supplier.nameWithCode : '';
  }

  onSupplierSelected(supplier: Supplier): void {
    this.selectedSupplier = supplier;
    this._notifyValueChange(supplier.id);
  }

  clearSelection(): void {
    this.supplierControl.setValue('');
    this.selectedSupplier = null;
    this._notifyValueChange(null);
  }
}
