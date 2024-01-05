import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, firstValueFrom, map } from 'rxjs';

import * as ProductActions from '../store/actions';
import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';
import { Product } from 'src/app/_models/product';
import { AuthService } from 'src/app/_services/auth.service';
import { ProductService } from 'src/app/_services/product.service';
import { StorageService } from 'src/app/_services/storage.service';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { ButtonOptions } from 'src/app/_enum/button-options.enum';
import { isLoadingSelector, textInventoriesSelector } from '../store/selectors';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { NotificationService } from 'src/app/shared/ui/notification/notification.service';

@Component({
  selector: 'app-text-inventories',
  templateUrl: './text-inventories.component.html',
  styleUrls: ['./text-inventories.component.scss']
})
export class TextInventoriesComponent extends BaseComponent implements OnInit {

  private _subscription: Subscription = new Subscription();
  private _textInventoriesForm: FormGroup;
  private _hintLabelText1: string;
  private _hintLabelText2: string;
  private _hasActiveTextInventories: boolean;
  private _showTextInventoriesTextAreaContainer: boolean = true;
  private _textInventoriesList: Product[];
  private _loadingLabel: string;

  constructor(
    private authService: AuthService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private store: Store<AppStateInterface>,
    private translateService: TranslateService,
    private storageService: StorageService,
    private notificationService: NotificationService,
    private productService: ProductService,
    private router: Router
  ) {
    super();
    this._textInventoriesForm = this.formBuilder.group({
      textInventories: ['', Validators.required],
    });

    if (storageService.hasKey("textInventories")) {
      this._textInventoriesForm.get('textInventories').setValue(storageService.getString("textInventories"));
    }

    this._subscription.add(this._textInventoriesForm.get('textInventories')
      .valueChanges
      .subscribe((value: string) => {
        storageService.storeString("textInventories", value);
      }));

    this._hintLabelText1 = this.translateService.instant(
      'TEXT_INVENTORIES_DIALOG.FORM_CONTROL_SECTION.TEXT_ORDER_CONTROL.HINT_LABEL_1'
    );
    this._hintLabelText2 = this.translateService.instant(
      'TEXT_INVENTORIES_DIALOG.FORM_CONTROL_SECTION.TEXT_ORDER_CONTROL.HINT_LABEL_2'
    );

    if (this.storageService.hasKey('textInventoriesList')) {
      const textProductInventories = (<Array<Product>>JSON.parse(this.storageService.getString('textInventoriesList'))).map((productObject: Product) => {
        const product = new Product();
        product.id = productObject.id;
        product.code = productObject.code;
        product.name = productObject.name;
        product.description = productObject.description;
        product.pricePerUnit = productObject.price;
        product.price = productObject.price;
        product.stockQuantity = productObject.stockQuantity;
        product.isTransferable = productObject.isTransferable;
        product.numberOfUnits = productObject.numberOfUnits;
        product.withdrawalSlipNo = productObject.withdrawalSlipNo;
        product.productUnit = productObject.productUnit;
        return product;
      })
      this.store.dispatch(ProductActions.analyzeTextInventoriesActionSuccess({ textProductInventories }));
    }

    this._subscription.add(
      this.store
        .pipe(select(textInventoriesSelector))
        .subscribe((textInventories: Array<Product>) => {
          this.storageService.storeString('textInventoriesList', JSON.stringify(textInventories));
          this._textInventoriesList = textInventories;
          this._hasActiveTextInventories = textInventories.length > 0;
        })
    );

    this.$isLoading = this.store.pipe(select(isLoadingSelector));
    this._loadingLabel = this.translateService.instant('TEXT_INVENTORIES_DIALOG.CONFIRM_ORDERS_DIALOG.LOADING_MESSAGE');
  }

  ngOnInit() { }

  ngOnDestroy() {
    this._subscription.unsubscribe();
    this.store.dispatch(ProductActions.resetTextInventoriesState());
  }

  processInventories() {
    const textInventories = this._textInventoriesForm.get('textInventories').value;
    if (textInventories) {
      this.store.dispatch(ProductActions.analyzeTextInventories({ textInventories }));
      this._showTextInventoriesTextAreaContainer = false;
    }
  }

  confirm() {
    if (this._textInventoriesList.length) {
      this.dialogService.openConfirmation(
        this.translateService.instant('TEXT_INVENTORIES_DIALOG.CONFIRM_ORDERS_DIALOG.TITLE'),
        this.translateService.instant('TEXT_INVENTORIES_DIALOG.CONFIRM_ORDERS_DIALOG.CONFIRM_MESSAGE'),
      ).subscribe((result: ButtonOptions) => {
        if (result === ButtonOptions.YES) {
          this.store.dispatch(ProductActions.setUpdateProductLoadingState({ state: true }));
          this.productService.updateProductInformation(this._textInventoriesList).subscribe({
            next: () => {
              this.store.dispatch(ProductActions.resetProductState());
              this.store.dispatch(ProductActions.getProductsAction());
              this.storageService.remove('textInventoriesList');
              this.storageService.remove('textInventories');
              this.store.dispatch(ProductActions.resetTextInventoriesState());
              this.store.dispatch(ProductActions.setUpdateProductLoadingState({ state: false }));
              this.notificationService.openSuccessNotification(this.translateService.instant('TEXT_INVENTORIES_DIALOG.CONFIRM_ORDERS_DIALOG.SUCCESS_MESSAGE'));
              this.router.navigate([`product-catalogue/product-list`]);
            },
            error: () => {
              this.notificationService.openErrorNotification(this.translateService.instant('TEXT_INVENTORIES_DIALOG.CONFIRM_ORDERS_DIALOG.ERROR_MESSAGE'));
            }
          });
        }
      })
    }
  }

  back() {
    this._showTextInventoriesTextAreaContainer = true;
    this.store.dispatch(ProductActions.resetTextInventoriesState());
  }

  findChoices = (searchText: string) => {
    return firstValueFrom(
      this.productService.getProductDetailList(this.authService.userId, searchText).pipe(
        map(productList => productList.map(product => `${product.code} : ${product.name} : ${product.productUnit.name}`)
        )
      )
    );
  }

  getChoiceLabel(choice: string) {
    return choice.trim().split(":")[0].trim();
  }

  get textInventoriesForm(): FormGroup {
    return this._textInventoriesForm;
  }

  get hintLabelText1() {
    return this._hintLabelText1;
  }

  get hintLabelText2() {
    return this._hintLabelText2;
  }

  get hasActiveTextInventories(): boolean {
    return this._hasActiveTextInventories;
  }

  get showTextInventoriesTextAreaContainer(): boolean {
    return this._showTextInventoriesTextAreaContainer;
  }

  get textInventoriesList(): Array<Product> {
    return this._textInventoriesList;
  }

  get loadingLabel(): string {
    return this._loadingLabel;
  }
}
