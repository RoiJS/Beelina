import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subject, of } from 'rxjs';
import { map, startWith, switchMap, debounceTime, distinctUntilChanged, takeUntil, tap } from 'rxjs/operators';

import { AuthService } from 'src/app/_services/auth.service';
import { TransactionService } from 'src/app/_services/transaction.service';
import { Transaction } from 'src/app/_models/transaction';
import { TransactionStatusEnum } from 'src/app/_enum/transaction-status.enum';

import { BaseControlComponent } from '../base-control/base-control.component';

@Component({
  selector: 'app-invoice-no-autocomplete-control',
  templateUrl: './invoice-no-autocomplete-control.component.html',
  styleUrls: ['./invoice-no-autocomplete-control.component.scss']
})
export class InvoiceNoAutocompleteControlComponent extends BaseControlComponent implements OnInit, OnDestroy {

  private _form: FormGroup;
  private _destroy$ = new Subject<void>();
  private _salesAgentId: number = 0;

  filteredTransactions$: Observable<Transaction[]>;

  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  private transactionService = inject(TransactionService);

  constructor(protected override translateService: TranslateService) {
    super(translateService);

    this._form = this.formBuilder.group({
      invoiceNo: [''],
    });

    this._salesAgentId = this.authService.userId;
  }

  override ngOnInit() {
    this.initializeAutocomplete();
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private initializeAutocomplete() {

    // Listen for selection changes to update other controls
    this.filteredTransactions$ = this._form.get('invoiceNo')!.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),

      tap((value: string | Transaction) => {
        if (value && typeof value === 'object' && value.invoiceNo) {
          this.updateTransactionTypeControl(value.status);
          this.updateDatePickerControl(value.transactionDate);
          this.disableRelatedControls();
        } else {
          this.enableRelatedControls();
        }
      }),

      switchMap((value: string | Transaction) => {
        const searchTerm = typeof value === 'string' ? value : value?.invoiceNo || '';

        if (searchTerm.length < 1) {
          return of([]);
        }

        return this.transactionService.getTransactionsByInvoiceNo(this._salesAgentId, searchTerm).pipe(
          map(result => result?.transactions || []),
          takeUntil(this._destroy$)
        );
      })
    );
  }

  setSalesAgentId(salesAgentId: number) {
    this._salesAgentId = salesAgentId;
    // Clean up existing subscriptions
    this._destroy$.next();
    // Reset the form and re-initialize autocomplete when sales agent changes
    this.initializeAutocomplete();
    // Enable related controls since we're clearing the invoice selection
    this.enableRelatedControls();
  }

  private updateTransactionTypeControl(transactionStatus: TransactionStatusEnum) {
    // Find the transaction type dropdown control
    const transactionTypeControl = this.otherControls.find(control =>
      control.name === 'TransactionTypeDropdownControl'
    );

    if (transactionTypeControl && transactionTypeControl.componentInstance) {
      // Update the transaction type form control value
      transactionTypeControl.componentInstance.form.get('transactionType')?.setValue(transactionStatus);
    }
  }

  private updateDatePickerControl(transactionDate: Date) {
    // Find the date picker control
    const datePickerControl = this.otherControls.find(control =>
      control.name === 'DatePickerControl'
    );

    if (datePickerControl && datePickerControl.componentInstance) {
      // Update the date picker form control value with the transaction date
      datePickerControl.componentInstance.form.get('date')?.setValue(new Date(transactionDate));
    }
  }

  private disableRelatedControls() {
    // Disable transaction type dropdown control
    const transactionTypeControl = this.otherControls.find(control =>
      control.name === 'TransactionTypeDropdownControl'
    );
    if (transactionTypeControl && transactionTypeControl.componentInstance) {
      transactionTypeControl.componentInstance.form.get('transactionType')?.disable();
    }

    // Disable date picker control
    const datePickerControl = this.otherControls.find(control =>
      control.name === 'DatePickerControl'
    );
    if (datePickerControl && datePickerControl.componentInstance) {
      datePickerControl.componentInstance.form.get('date')?.disable();
    }
  }

  private enableRelatedControls() {
    // Enable transaction type dropdown control
    const transactionTypeControl = this.otherControls.find(control =>
      control.name === 'TransactionTypeDropdownControl'
    );
    if (transactionTypeControl && transactionTypeControl.componentInstance) {
      transactionTypeControl.componentInstance.form.get('transactionType')?.enable();
    }

    // Enable date picker control
    const datePickerControl = this.otherControls.find(control =>
      control.name === 'DatePickerControl'
    );
    if (datePickerControl && datePickerControl.componentInstance) {
      datePickerControl.componentInstance.form.get('date')?.enable();
    }
  }

  displayTransaction(transaction: Transaction): string {
    if (!transaction) {
      return '';
    }
    return transaction && transaction.invoiceNo ? transaction.invoiceNo : '';
  }

  override value(value: any = null): string {
    const currentValue = this._form.get('invoiceNo')?.value;

    // If no value is selected, return empty string to indicate "All"
    if (!currentValue || currentValue === '') {
      return '';
    }

    if (typeof currentValue === 'string') {
      return currentValue;
    } else if (currentValue && currentValue.invoiceNo) {
      return currentValue.invoiceNo;
    }

    return '';
  }

  override validate(): boolean {
    return this.isValidSelection();
  }

  private isValidSelection(): boolean {
    const currentValue = this._form.get('invoiceNo')?.value;

    // Empty value means "All" which is valid
    if (!currentValue || currentValue === '') {
      return true;
    }

    // If the current value is a string (user typed something but didn't select from dropdown)
    if (typeof currentValue === 'string') {
      // This means user typed an invoice number but didn't select a valid option
      // Non-empty strings without selection are invalid
      return false;
    }

    // If the current value is an object with invoiceNo, it means a valid selection was made
    if (currentValue && typeof currentValue === 'object' && currentValue.invoiceNo) {
      return true;
    }

    // Any other case is invalid
    return false;
  }

  get form(): FormGroup {
    return this._form;
  }

  get hasValidSelection(): boolean {
    const value = this._form.get('invoiceNo')?.value;
    return value && typeof value === 'object' && value.invoiceNo;
  }

  get isInvalidSelection(): boolean {
    // Use the centralized validation logic - invalid selection is the opposite of valid
    return !this.isValidSelection();
  }

  get validationErrorMessage(): string {
    if (this.isInvalidSelection) {
      return this.translateService.instant('REPORT_DETAILS_PAGE.FORM_CONTROL_ERRORS.INVALID_INVOICE_SELECTION');
    }
    return '';
  }
}
