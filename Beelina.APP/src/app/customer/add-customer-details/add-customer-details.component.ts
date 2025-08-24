import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { select, Store } from '@ngrx/store';

import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import { TranslateService } from '@ngx-translate/core';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';

import { CustomerStoreService } from 'src/app/_services/customer-store.service';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { LocalCustomerStoresDbService } from 'src/app/_services/local-db/local-customer-stores-db.service';
import { NotificationService } from 'src/app/shared/ui/notification/notification.service';

import { paymentMethodsSelector } from 'src/app/payment-methods/store/selectors';

import * as BarangayActions from '../../barangays/store/actions';
import * as CustomerStoresActions from '../../customer/store/actions';
import * as PaymentMethodActions from '../../payment-methods/store/actions';
import { isUpdateLoadingSelector } from '../store/selectors';

import { ButtonOptions } from 'src/app/_enum/button-options.enum';
import { OutletTypeEnum } from 'src/app/_enum/outlet-type.enum';

import { CustomerStore } from 'src/app/_models/customer-store';
import { PaymentMethod } from 'src/app/_models/payment-method';

@Component({
  selector: 'app-add-customer-details',
  templateUrl: './add-customer-details.component.html',
  styleUrls: ['./add-customer-details.component.scss'],
})
export class AddCustomerDetailsComponent implements OnInit, OnDestroy {
  private _customerForm: FormGroup;

  private _paymentMethodOptions: Array<PaymentMethod> = [];
  private _paymentMethodOptionsSubscription: Subscription;
  private _outletTypeOptions: Array<{value: OutletTypeEnum, label: string}> = [];

  private _barangay: string;

  private activatedRoute = inject(ActivatedRoute);
  private customerStoreService = inject(CustomerStoreService);
  private dialogService = inject(DialogService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private localCustomerStoresDbService = inject(LocalCustomerStoresDbService);
  private store = inject(Store<AppStateInterface>);
  private translateService = inject(TranslateService);

  $isLoading: Observable<boolean>;

  constructor() {
    this._customerForm = this.formBuilder.group({
      name: ['', Validators.required],
      address: [''],
      emailAddress: ['', Validators.email],
      outletType: [null, Validators.required],
      paymentMethod: ['', Validators.required],
      barangay: ['', Validators.required],
    });

    this.$isLoading = this.store.pipe(select(isUpdateLoadingSelector));
  }

  ngOnInit() {
    const barangayControl = this._customerForm.get('barangay');
    this._barangay = this.activatedRoute.snapshot.paramMap.get('barangay');

    barangayControl.setValue(this._barangay);
    barangayControl.disable();

    this._outletTypeOptions = this.customerStoreService.getOutletTypeOptions('ADD_CUSTOMER_DETAILS_PAGE');

    this.store.dispatch(PaymentMethodActions.getPaymentMethodsAction());
    this.store.dispatch(BarangayActions.getBarangaysAction());

    this._paymentMethodOptionsSubscription = this.store
      .pipe(select(paymentMethodsSelector))
      .subscribe((paymentMethods: Array<PaymentMethod>) => {
        this._paymentMethodOptions = paymentMethods;
      });
  }

  ngOnDestroy() {
    this._paymentMethodOptionsSubscription.unsubscribe();
    this.store.dispatch(CustomerStoresActions.resetCustomerState());
  }

  saveNewCustomer() {
    const customerStore = new CustomerStore();
    customerStore.name = this._customerForm.get('name').value;
    customerStore.address = this._customerForm.get('address').value;
    customerStore.emailAddress = this._customerForm.get('emailAddress').value;
    customerStore.outletType = this._customerForm.get('outletType').value;
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
                next: (customerStore: CustomerStore) => {
                  this.localCustomerStoresDbService.manageLocalCustomerStore(customerStore);
                  this.notificationService.openSuccessNotification(this.translateService.instant(
                    'ADD_CUSTOMER_DETAILS_PAGE.SAVE_NEW_CUSTOMER_DIALOG.SUCCESS_MESSAGE'
                  ));
                  this.store.dispatch(
                    CustomerStoresActions.setUpdateCustomerLoadingState({
                      state: false,
                    })
                  );
                  this.router.navigate([`/customer-accounts/${this._barangay}`]);
                },

                error: () => {
                  this.notificationService.openErrorNotification(this.translateService.instant(
                    'ADD_CUSTOMER_DETAILS_PAGE.SAVE_NEW_CUSTOMER_DIALOG.ERROR_MESSAGE'
                  ));

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

  get customerForm(): FormGroup {
    return this._customerForm;
  }

  get paymentMethodOptions(): Array<PaymentMethod> {
    return this._paymentMethodOptions;
  }

  get outletTypeOptions(): Array<{value: OutletTypeEnum, label: string}> {
    return this._outletTypeOptions;
  }
}
