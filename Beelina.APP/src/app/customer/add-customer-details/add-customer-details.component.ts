import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { select, Store } from '@ngrx/store';

import { map, Observable, startWith, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { PaymentMethod } from 'src/app/_services/payment-method.service';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import {
  CustomerStore,
  CustomerStoreService,
} from 'src/app/_services/customer-store.service';

import { paymentMethodsSelector } from 'src/app/payment-methods/store/selectors';
import { isUpdateLoadingSelector } from '../store/selectors';
import * as PaymentMethodActions from '../../payment-methods/store/actions';
import * as CustomerStoresActions from '../../customer/store/actions';

import { ButtonOptions } from 'src/app/_enum/button-options.enum';

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
    });

    this.$isLoading = this.store.pipe(select(isUpdateLoadingSelector));
  }

  ngOnInit() {
    this.store.dispatch(PaymentMethodActions.getPaymentMethodsAction());

    this._paymentMethodOptionsSubscription = this.store
      .pipe(select(paymentMethodsSelector))
      .subscribe((paymentMethods: Array<PaymentMethod>) => {
        this._paymentMethodOptions = paymentMethods;
      });

    this._paymentMethodFilterOptions = this._customerForm
      .get('paymentMethod')
      .valueChanges.pipe(
        startWith(''),
        map((value) => this._filter(value || ''))
      );
  }

  ngOnDestroy() {
    this._paymentMethodOptionsSubscription.unsubscribe();
    this.store.dispatch(CustomerStoresActions.resetCustomerState());
  }

  saveNewCustomer() {
    const customerStore = new CustomerStore();
    customerStore.name = this._customerForm.get('name').value;
    customerStore.address = this._customerForm.get('address').value;
    customerStore.paymentMethod.name =
      this._customerForm.get('paymentMethod').value;

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

  private _filter(value: string): Array<PaymentMethod> {
    const filterValue = value?.toLowerCase();

    return this._paymentMethodOptions.filter((option) =>
      option.name?.toLowerCase().includes(filterValue)
    );
  }

  get customerForm(): FormGroup {
    return this._customerForm;
  }

  get paymentMethodFilterOptions(): Observable<Array<PaymentMethod>> {
    return this._paymentMethodFilterOptions;
  }
}
