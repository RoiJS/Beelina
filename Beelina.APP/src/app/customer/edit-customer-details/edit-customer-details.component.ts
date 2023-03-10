import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { map, Observable, startWith, Subscription } from 'rxjs';

import { ButtonOptions } from 'src/app/_enum/button-options.enum';
import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import {
  CustomerStore,
  CustomerStoreService,
} from 'src/app/_services/customer-store.service';
import { PaymentMethod } from 'src/app/_services/payment-method.service';

import * as PaymentMethodActions from '../../payment-methods/store/actions';
import * as CustomerStoresActions from '../store/actions';

import { paymentMethodsSelector } from 'src/app/payment-methods/store/selectors';
import { isUpdateLoadingSelector } from '../store/selectors';

import { StoreInformationResult } from 'src/app/_models/results/store-information-result';

@Component({
  selector: 'app-edit-customer',
  templateUrl: './edit-customer-details.component.html',
  styleUrls: ['./edit-customer-details.component.scss'],
})
export class EditCustomerDetailsComponent implements OnInit {
  private _customerForm: FormGroup;
  private _paymentMethodOptions: Array<PaymentMethod> = [];
  private _paymentMethodFilterOptions: Observable<Array<PaymentMethod>>;
  private _paymentMethodOptionsSubscription: Subscription;
  private _storeId: number;
  $isLoading: Observable<boolean>;

  constructor(
    private activatedRoute: ActivatedRoute,
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

    this._storeId = +this.activatedRoute.snapshot.paramMap.get('id');
    this.customerStoreService
      .getCustomerStore(this._storeId)
      .subscribe((customerStore: StoreInformationResult) => {

        this._customerForm.get('name').setValue(customerStore.name);
        this._customerForm.get('address').setValue(customerStore.address);
        this._customerForm
          .get('paymentMethod')
          .setValue(customerStore.paymentMethod.name);
      });

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

  ngOnDestroy(): void {
    this._paymentMethodOptionsSubscription.unsubscribe();
    this.store.dispatch(CustomerStoresActions.resetCustomerState());
  }

  updateCustomer() {
    const customerStore = new CustomerStore();
    customerStore.id = this._storeId;
    customerStore.name = this._customerForm.get('name').value;
    customerStore.address = this._customerForm.get('address').value;
    customerStore.paymentMethod.name =
      this._customerForm.get('paymentMethod').value;

    this._customerForm.markAllAsTouched();

    if (this._customerForm.valid) {
      this.dialogService
        .openConfirmation(
          this.translateService.instant(
            'EDIT_CUSTOMER_DETAILS_PAGE.EDIT_CUSTOMER_DIALOG.TITLE'
          ),
          this.translateService.instant(
            'EDIT_CUSTOMER_DETAILS_PAGE.EDIT_CUSTOMER_DIALOG.CONFIRM'
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
                      'EDIT_CUSTOMER_DETAILS_PAGE.EDIT_CUSTOMER_DIALOG.SUCCESS_MESSAGE'
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
                      'EDIT_CUSTOMER_DETAILS_PAGE.EDIT_CUSTOMER_DIALOG.ERROR_MESSAGE'
                    ),
                    this.translateService.instant('GENERAL_TEXTS.CLOSE'),
                    {
                      duration: 5000,
                    }
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
