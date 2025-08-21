import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormControl } from '@angular/forms';
import { Observable, Subscription, startWith, debounceTime, distinctUntilChanged, switchMap, tap, of } from 'rxjs';

import { AuthService } from 'src/app/_services/auth.service';
import { ProductService } from 'src/app/_services/product.service';
import { User } from 'src/app/_models/user.model';

import { BaseControlComponent } from '../base-control/base-control.component';
import { getSalesAgentTypeEnumNumeric } from 'src/app/_enum/sales-agent-type.enum';

@Component({
  selector: 'app-sales-agent-dropdown-control',
  templateUrl: './sales-agent-dropdown-control.component.html',
  styleUrls: ['./sales-agent-dropdown-control.component.scss']
})
export class SalesAgentDropdownControlComponent extends BaseControlComponent implements OnInit, OnDestroy {

  private _subscription: Subscription = new Subscription();
  private _salesAgentsLoaded: boolean = false;
  private _allSalesAgents: Array<User> = [];

  private authService = inject(AuthService);
  private productService = inject(ProductService);

  salesAgentControl = new FormControl();
  filteredSalesAgents: Observable<Array<User>>;
  selectedSalesAgent: User;

  constructor(protected override translateService: TranslateService) {
    super(translateService);
  }

  override ngOnInit() {
    // Load all sales agents once at initialization
    this._loadAllSalesAgents();

    this.filteredSalesAgents = this.salesAgentControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      tap((value: string | User | number) => {
        // Handle selection state and notify value changes
        if (value === 0) {
          // "All" option selected
          this.selectedSalesAgent = null;
          this._notifyValueChange(0);
        } else if (typeof value === 'object' && value !== null) {
          this.selectedSalesAgent = value;
          this._notifyValueChange(value.id);
          this.updateInvoiceNumberControlSalesAgent(value.id);
        } else if (typeof value === 'string') {
          this.selectedSalesAgent = null;
          this._notifyValueChange(null);
        }
      }),
      switchMap((value: string | User | number) => {
        if (typeof value === 'string') {
          return this._filterSalesAgentsFromCache(value);
        } else {
          return of([]);
        }
      })
    );

    // Set initial value if provided
    const initialValue = this.value();
    if (initialValue && typeof initialValue === 'number') {
      this._loadInitialSalesAgent(initialValue);
    }
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  private updateInvoiceNumberControlSalesAgent(salesAgentId: number) {
    // Find the invoice number autocomplete control
    const invoiceNoControl = this.otherControls.find(control =>
      control.name === 'InvoiceNoAutocompleteControl'
    );

    if (invoiceNoControl && invoiceNoControl.componentInstance) {
      // Update the sales agent ID in the invoice number control
      if (invoiceNoControl.componentInstance.setSalesAgentId) {
        invoiceNoControl.componentInstance.setSalesAgentId(salesAgentId);
      }
    }
  }

  override value(value: any = null): any {
    if (value !== null && value !== undefined) {
      // Setting value
      if (value === 0 || value === '0') {
        // Handle "All" option
        this.salesAgentControl.setValue(0);
        this.selectedSalesAgent = null;
        return '0';
      } else {
        this._loadInitialSalesAgent(value);
        return value;
      }
    } else {
      // Getting value
      if (this.salesAgentControl.value === 0) {
        return '0'; // "All" option
      }
      return this.selectedSalesAgent ? this.selectedSalesAgent.id.toString() : null;
    }
  }

  override validate(): boolean {
    if (this.hide) {
      // When hidden, auto-select current user
      const currentUserId = this.authService.userId;
      if (this._salesAgentsLoaded) {
        const currentUser = this._allSalesAgents.find(u => u.id === currentUserId);
        if (currentUser) {
          this.selectedSalesAgent = currentUser;
          this.salesAgentControl.setValue(currentUser);
        }
      }
      return true; // Always valid when hidden
    }

    return this.isValidSelection();
  }

  private isValidSelection(): boolean {
    const currentValue = this.salesAgentControl.value;

    // If "All" option is allowed and selected, it's valid
    if (this.allowAllOption && currentValue === 0) {
      return true;
    }

    // If a sales agent is selected (object with id), it's valid
    if (this.selectedSalesAgent && typeof this.selectedSalesAgent === 'object' && this.selectedSalesAgent.id) {
      return true;
    }

    // If current value is a string (user typed but didn't select), it's invalid
    if (typeof currentValue === 'string' && currentValue.trim() !== '') {
      return false;
    }

    // Empty string when no selection is made - invalid unless "All" is allowed and this represents "All"
    if (!currentValue || currentValue === '') {
      return false;
    }

    return false;
  }

  get isInvalidSelection(): boolean {
    // Only show error if the control is visible and the selection is invalid
    return !this.hide && !this.isValidSelection();
  }

  get validationErrorMessage(): string {
    if (this.isInvalidSelection) {
      return this.translateService.instant('REPORT_DETAILS_PAGE.FORM_CONTROL_ERRORS.INVALID_SALES_AGENT_SELECTION');
    }
    return '';
  }

  private _notifyValueChange(value: any): void {
    // This will be used to notify parent components of value changes
    // The base class doesn't have onValueChange, so we'll implement our own mechanism
  }

  private _loadAllSalesAgents(): void {
    if (!this._salesAgentsLoaded) {
      this._subscription.add(
        this.productService.getSalesAgentsList().subscribe({
          next: (data: Array<User>) => {
            // Apply agent type filtering if specified
            if (this.agentTypeOptions) {
              data = data.filter((user: User) =>
                this.agentTypeOptions.includes(getSalesAgentTypeEnumNumeric(user.salesAgentType).toString())
              );
            }

            this._allSalesAgents = data;
            this._salesAgentsLoaded = true;
          },
        })
      );
    }
  }

  private _filterSalesAgentsFromCache(value: string): Observable<Array<User>> {
    if (!value || value.length < 2) {
      return of([]);
    }

    if (!this._salesAgentsLoaded) {
      return of([]);
    }

    const filteredSalesAgents = this._allSalesAgents.filter(salesAgent =>
      salesAgent.fullname && salesAgent.fullname.toLowerCase().includes(value.toLowerCase()) ||
      salesAgent.username && salesAgent.username.toLowerCase().includes(value.toLowerCase())
    );

    return of(filteredSalesAgents);
  }

  // Extracted helper to apply agent-type filtering
  private _applyAgentTypeFilter(agents: Array<User>): Array<User> {
    if (this.agentTypeOptions) {
      return agents.filter((user: User) =>
        this.agentTypeOptions.includes(
          getSalesAgentTypeEnumNumeric(user.salesAgentType).toString()
        )
      );
    }
    return agents;
  }

  // Extracted helper to select and set the initial sales agent
  private _selectSalesAgent(salesAgentId: number): void {
    const salesAgent = this._allSalesAgents.find(s => s.id === salesAgentId);
    if (salesAgent) {
      this.selectedSalesAgent = salesAgent;
      this.salesAgentControl.setValue(salesAgent);
    }
  }

  private _loadInitialSalesAgent(salesAgentId: number): void {
    // Check if we have cached sales agents first
    if (this.productService.cachedSalesAgents) {
      // Get a copy of the cached agents and apply filtering
      const cachedAgents = [...this.productService.cachedSalesAgents];
      this._allSalesAgents = this._applyAgentTypeFilter(cachedAgents);
      this._salesAgentsLoaded = true;
      this._selectSalesAgent(salesAgentId);
    } else {
      // If sales agents not loaded yet, load them first
      this._subscription.add(
        this.productService.getSalesAgentsList().subscribe({
          next: (data: Array<User>) => {
            this._allSalesAgents = this._applyAgentTypeFilter(data);
            this._salesAgentsLoaded = true;
            this._selectSalesAgent(salesAgentId);
          },
        })
      );
    }
  }
  displaySalesAgent(salesAgent: User | number): string {
    if (salesAgent === 0) {
      return this.translateService.instant('GENERAL_TEXTS.ALL');
    }
    return salesAgent && typeof salesAgent === 'object' ? salesAgent.fullname : '';
  }

  onSalesAgentSelected(salesAgent: User): void {
    this.selectedSalesAgent = salesAgent;
    this._notifyValueChange(salesAgent.id);
    this.updateInvoiceNumberControlSalesAgent(salesAgent.id);
  }

  clearSelection(): void {
    this.salesAgentControl.setValue('');
    this.selectedSalesAgent = null;
    this._notifyValueChange(null);
  }

  get salesAgents(): Array<User> {
    return this._allSalesAgents;
  }
}
