import { ActiveStatusControlComponent } from './active-status-control/active-status-control.component';
import { CustomerDropdownControlComponent } from './customer-dropdown-control/customer-dropdown-control.component';
import { DatePickerComponent } from './date-picker/date-picker.component';
import { DateRangeControlComponent } from './date-range-control/date-range-control.component';
import { InvoiceNoAutocompleteControlComponent } from './invoice-no-autocomplete-control/invoice-no-autocomplete-control.component';
import { PurchaseOrderReferenceNoAutocompleteControlComponent } from './purchase-order-reference-no-autocomplete-control/purchase-order-reference-no-autocomplete-control.component';
import { SalesAgentDropdownControlComponent } from './sales-agent-dropdown-control/sales-agent-dropdown-control.component';
import { SortOrderControlComponent } from './sort-order-control/sort-order-control.component';
import { SupplierAutocompleteControlComponent } from './supplier-autocomplete-control/supplier-autocomplete-control.component';
import { TransactionTypeDropdownControlComponent } from './transaction-type-dropdown-control/transaction-type-dropdown-control.component';

// Define a component registry to map component names to their actual component classes
export const componentsRegistry: { [key: string]: any } = {
  DateRangeControl: DateRangeControlComponent,
  DatePickerControl: DatePickerComponent,
  StartDatePickerControl: DatePickerComponent,
  EndDatePickerControl: DatePickerComponent,
  SortOrderDropdownControl: SortOrderControlComponent,
  SalesAgentDropdownControl: SalesAgentDropdownControlComponent,
  TransactionTypeDropdownControl: TransactionTypeDropdownControlComponent,
  CustomerDropdownControl: CustomerDropdownControlComponent,
  InvoiceNoAutocompleteControl: InvoiceNoAutocompleteControlComponent,
  PurchaseOrderReferenceNoAutocompleteControl: PurchaseOrderReferenceNoAutocompleteControlComponent,
  SupplierAutocompleteControl: SupplierAutocompleteControlComponent,
  ActiveStatusDropdownControl: ActiveStatusControlComponent,
};
