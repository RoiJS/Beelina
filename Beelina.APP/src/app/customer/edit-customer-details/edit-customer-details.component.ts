import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription, map, startWith } from 'rxjs';

import { ButtonOptions } from 'src/app/_enum/button-options.enum';
import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';

import { CustomerStoreService } from 'src/app/_services/customer-store.service';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { NotificationService } from 'src/app/shared/ui/notification/notification.service';

import * as BarangayActions from '../../barangays/store/actions';
import * as PaymentMethodActions from '../../payment-methods/store/actions';
import * as CustomerStoresActions from '../store/actions';

import { paymentMethodsSelector } from 'src/app/payment-methods/store/selectors';
import { isUpdateLoadingSelector } from '../store/selectors';

import { StoreInformationResult } from 'src/app/_models/results/store-information-result';

import { CustomerStore } from 'src/app/_models/customer-store';
import { PaymentMethod } from 'src/app/_models/payment-method';

@Component({
  selector: 'app-edit-customer',
  templateUrl: './edit-customer-details.component.html',
  styleUrls: ['./edit-customer-details.component.scss'],
})
export class EditCustomerDetailsComponent implements OnInit {
  private _customerForm: FormGroup;

  private _paymentMethodOptions: Array<PaymentMethod> = [];
  private _paymentMethodOptionsSubscription: Subscription;

  private _storeId: number;
  $isLoading: Observable<boolean>;
  private _barangay: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private store: Store<AppStateInterface>,
    private dialogService: DialogService,
    private customerStoreService: CustomerStoreService,
    private formBuilder: FormBuilder,
    private router: Router,
    private notificationService: NotificationService,
    private translateService: TranslateService
  ) {
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
    this._barangay = this.activatedRoute.snapshot.paramMap.get('barangay');
    const barangayControl = this._customerForm.get('barangay');
    barangayControl.disable();

    this.store.dispatch(PaymentMethodActions.getPaymentMethodsAction());
    this.store.dispatch(BarangayActions.getBarangaysAction());

    this._storeId = +this.activatedRoute.snapshot.paramMap.get('id');
    this.customerStoreService
      .getCustomerStore(this._storeId)
      .subscribe((customerStore: StoreInformationResult) => {
        this._customerForm.get('name').setValue(customerStore.name);
        this._customerForm.get('address').setValue(customerStore.address);
        this._customerForm.get('emailAddress').setValue(customerStore.emailAddress);
        this._customerForm.get('outletType').setValue(customerStore.outletType);
        this._customerForm
          .get('paymentMethod')
          .setValue(customerStore.paymentMethod.name);
        this._customerForm
          .get('barangay')
          .setValue(customerStore.barangay.name);
      });

    this._paymentMethodOptionsSubscription = this.store
      .pipe(select(paymentMethodsSelector))
      .subscribe((paymentMethods: Array<PaymentMethod>) => {
        this._paymentMethodOptions = paymentMethods;
      });
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
                  this.notificationService.openSuccessNotification(this.translateService.instant(
                    'EDIT_CUSTOMER_DETAILS_PAGE.EDIT_CUSTOMER_DIALOG.SUCCESS_MESSAGE'
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
                    'EDIT_CUSTOMER_DETAILS_PAGE.EDIT_CUSTOMER_DIALOG.ERROR_MESSAGE'
                  ));
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
}
