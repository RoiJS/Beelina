import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { select, Store } from '@ngrx/store';

import { map, Observable, startWith, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { CustomerStoreService } from 'src/app/_services/customer-store.service';

import { paymentMethodsSelector } from 'src/app/payment-methods/store/selectors';
import { barangaysSelector } from 'src/app/barangays/store/selectors';

import { isUpdateLoadingSelector } from '../store/selectors';
import * as PaymentMethodActions from '../../payment-methods/store/actions';
import * as BarangayActions from '../../barangays/store/actions';
import * as CustomerStoresActions from '../../customer/store/actions';

import { ButtonOptions } from 'src/app/_enum/button-options.enum';

import { Barangay } from 'src/app/_models/barangay';
import { PaymentMethod } from 'src/app/_models/payment-method';
import { CustomerStore } from 'src/app/_models/customer-store';

@Component({
  selector: 'app-add-customer-details',
  templateUrl: './add-customer-details.component.html',
  styleUrls: ['./add-customer-details.component.scss'],
})
export class AddCustomerDetailsComponent implements OnInit, OnDestroy {
  private _customerForm: FormGroup;

  private _paymentMethodOptions: Array<PaymentMethod> = [];
  private _paymentMethodFilterOptions: Observable<Array<PaymentMethod>>;
  private _paymentMethodOptionsSubscription: Subscription;

  private _barangayOptions: Array<Barangay> = [];
  private _barangayFilterOptions: Observable<Array<Barangay>>;
  private _barangayOptionsSubscription: Subscription;

  $isLoading: Observable<boolean>;

  constructor(
    private store: Store<AppStateInterface>,
    private dialogService: DialogService,
    private customerStoreService: CustomerStoreService,
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBarService: MatSnackBar,
    private translateService: TranslateService
  ) {
    this._customerForm = this.formBuilder.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      paymentMethod: ['', Validators.required],
      barangay: ['', Validators.required],
    });

    this.$isLoading = this.store.pipe(select(isUpdateLoadingSelector));
  }

  ngOnInit() {
    this.store.dispatch(PaymentMethodActions.getPaymentMethodsAction());
    this.store.dispatch(BarangayActions.getBarangaysAction());

    this._paymentMethodOptionsSubscription = this.store
      .pipe(select(paymentMethodsSelector))
      .subscribe((paymentMethods: Array<PaymentMethod>) => {
        this._paymentMethodOptions = paymentMethods;
      });

    this._barangayOptionsSubscription = this.store
      .pipe(select(barangaysSelector))
      .subscribe((barangays: Array<Barangay>) => {
        this._barangayOptions = barangays;
      });

    this._barangayFilterOptions = this._customerForm
      .get('barangay')
      .valueChanges.pipe(
        startWith(''),
        map((value) => this._filterBarangays(value || ''))
      );

    this._paymentMethodFilterOptions = this._customerForm
      .get('paymentMethod')
      .valueChanges.pipe(
        startWith(''),
        map((value) => this._filterPaymentMethods(value || ''))
      );
  }

  ngOnDestroy() {
    this._paymentMethodOptionsSubscription.unsubscribe();
    this._barangayOptionsSubscription.unsubscribe();
    this.store.dispatch(CustomerStoresActions.resetCustomerState());
  }

  saveNewCustomer() {
    const customerStore = new CustomerStore();
    customerStore.name = this._customerForm.get('name').value;
    customerStore.address = this._customerForm.get('address').value;
    customerStore.paymentMethod.name =
      this._customerForm.get('paymentMethod').value;
    customerStore.barangay.name = this._customerForm.get('barangay').value;

    this._customerForm.markAllAsTouched();

    if (this._customerForm.valid) {
      this.dialogService
        .openConfirmation(
          this.translateService.instant(
            'ADD_CUSTOMER_DETAILS_PAGE.SAVE_NEW_CUSTOMER_DIALOG.TITLE'
          ),
          this.translateService.instant(
            'ADD_CUSTOMER_DETAILS_PAGE.SAVE_NEW_CUSTOMER_DIALOG.CONFIRM'
          )
        )
        .subscribe((result: ButtonOptions) => {
          if (result === ButtonOptions.YES) {
            this.store.dispatch(
              CustomerStoresActions.setUpdateCustomerLoadingState({
                state: true,
              })
            );
            this.customerStoreService
              .updateStoreInformation(customerStore)
              .subscribe({
                next: () => {
                  this.snackBarService.open(
                    this.translateService.instant(
                      'ADD_CUSTOMER_DETAILS_PAGE.SAVE_NEW_CUSTOMER_DIALOG.SUCCESS_MESSAGE'
                    ),
                    this.translateService.instant('GENERAL_TEXTS.CLOSE'),
                    {
                      duration: 5000,
                    }
                  );
                  this.store.dispatch(
                    CustomerStoresActions.setUpdateCustomerLoadingState({
                      state: false,
                    })
                  );
                  this.router.navigate(['/customers']);
                },

                error: () => {
                  this.snackBarService.open(
                    this.translateService.instant(
                      'ADD_CUSTOMER_DETAILS_PAGE.SAVE_NEW_CUSTOMER_DIALOG.ERROR_MESSAGE'
                    ),
                    this.translateService.instant('GENERAL_TEXTS.CLOSE'),
                    {
                      duration: 5000,
                    }
                  );

                  this.store.dispatch(
                    CustomerStoresActions.setUpdateCustomerLoadingState({
                      state: false,
                    })
                  );
                },
              });
          }
        });
    }
  }

  private _filterPaymentMethods(value: string): Array<PaymentMethod> {
    const filterValue = value?.toLowerCase();

    return this._paymentMethodOptions.filter((option) =>
      option.name?.toLowerCase().includes(filterValue)
    );
  }

  private _filterBarangays(value: string): Array<Barangay> {
    const filterValue = value?.toLowerCase();

    return this._barangayOptions.filter((option) =>
      option.name?.toLowerCase().includes(filterValue)
    );
  }

  get customerForm(): FormGroup {
    return this._customerForm;
  }

  get paymentMethodFilterOptions(): Observable<Array<PaymentMethod>> {
    return this._paymentMethodFilterOptions;
  }

  get barangayFilterOptions(): Observable<Array<Barangay>> {
    return this._barangayFilterOptions;
  }
}
