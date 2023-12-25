import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Product } from 'src/app/_models/product';
import { ProductInformationResult } from 'src/app/_models/results/product-information-result';
import { ProductService } from 'src/app/_services/product.service';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';

import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { ButtonOptions } from 'src/app/_enum/button-options.enum';
import { StorageService } from 'src/app/_services/storage.service';
import { AuthService } from 'src/app/_services/auth.service';

import { TransferProductStockTypeEnum } from 'src/app/_enum/transfer-product-stock-type.enum';

@Component({
  selector: 'app-transfer-product-inventory',
  templateUrl: './transfer-product-inventory.component.html',
  styleUrls: ['./transfer-product-inventory.component.scss']
})
export class TransferProductInventoryComponent extends BaseComponent implements OnInit {

  private _transferProductStockForm: FormGroup;
  private _bulkToPiecesGroupForm: FormGroup;
  private _piecesToBulkGroupForm: FormGroup;
  private _sourceProduct: Product;
  private _destinationProductOptions: Array<Product>;

  private _sourceProductNumberOfUnitsLabel: string;
  private _destinationProductNumberOfUnitsLabel: string;
  private _sourceProductQuantityToBeTransferedLabel: string;

  private _transferProductTypeOptionsArray: Array<{ key: string; value: string }> = [];

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<TransferProductInventoryComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: {
      productId: number;
    },
    private authService: AuthService,
    private snackBarService: MatSnackBar,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private translateService: TranslateService,
    private storageService: StorageService,
  ) {
    super();
    this._transferProductStockForm = this.formBuilder.group({
      transferType: [TransferProductStockTypeEnum.BULK_TO_PIECE, [Validators.required]],
    });

    this._bulkToPiecesGroupForm = this.formBuilder.group({
      numberOfUnits: [0, [Validators.required, Validators.min(1)]],
      productDestination: [0, [Validators.required]],
      quantityToBeTransfered: [0, [Validators.required, Validators.min(1)]]
    });

    this._piecesToBulkGroupForm = this.formBuilder.group({
      productDestination: [0, [Validators.required]],
      numberOfUnits: [0, [Validators.required, Validators.min(1)]],
      quantityToBeTransfered: [0, [Validators.required, Validators.min(1)]]
    })

    this._transferProductTypeOptionsArray = [
      {
        key: this.translateService.instant('TRANSFER_PRODUCT_STOCK_DIALOG.FORM_CONTROL_SECTION.TRANSFER_PRODUCT_TYPE_CONTROL.OPTIONS_CONTROL.BULK_TO_PIECE'),
        value: TransferProductStockTypeEnum.BULK_TO_PIECE
      },
      {
        key: this.translateService.instant('TRANSFER_PRODUCT_STOCK_DIALOG.FORM_CONTROL_SECTION.TRANSFER_PRODUCT_TYPE_CONTROL.OPTIONS_CONTROL.PIECE_TO_BULK'),
        value: TransferProductStockTypeEnum.PIECE_TO_BULK
      }
    ];

    this._piecesToBulkGroupForm.get('productDestination').valueChanges.subscribe((value: number) => {
      const destinationProduct = this._destinationProductOptions.find(p => p.id === value);
      this._piecesToBulkGroupForm.get('numberOfUnits').setValue(destinationProduct.numberOfUnits);
      if (destinationProduct.numberOfUnits > 0){
        this._piecesToBulkGroupForm.get('numberOfUnits').disable();
      } else {
        this._piecesToBulkGroupForm.get('numberOfUnits').enable();
      }
      this._destinationProductNumberOfUnitsLabel = this.translateService.instant('TRANSFER_PRODUCT_STOCK_DIALOG.FORM_CONTROL_SECTION.PIECES_TO_BULK_CONTROL.NUMBER_OF_UNITS_CONTROL.LABEL').replace("__PRODUCT_UNIT__", destinationProduct.productUnit.name);
    });

    this._isLoading = true;
    this.productService
      .getProduct(data.productId)
      .subscribe((result: ProductInformationResult) => {
        this._sourceProduct = new Product();
        this._sourceProduct.id = result.id;
        this._sourceProduct.code = result.code;
        this._sourceProduct.name = result.name;
        this._sourceProduct.description = result.description;
        this._sourceProduct.stockQuantity = result.stockQuantity;
        this._sourceProduct.price = result.pricePerUnit;
        this._sourceProduct.numberOfUnits = result.numberOfUnits;
        this._sourceProduct.productUnit.name = result.productUnit.name;

        this._bulkToPiecesGroupForm.get('numberOfUnits').setValue(this._sourceProduct.numberOfUnits);
        if (this._sourceProduct.numberOfUnits > 0){
          this._bulkToPiecesGroupForm.get('numberOfUnits').disable();
        } else {
          this._bulkToPiecesGroupForm.get('numberOfUnits').enable();
        }
        this._bulkToPiecesGroupForm.get('quantityToBeTransfered').setValidators(Validators.max(this._sourceProduct.stockQuantity));
        this._piecesToBulkGroupForm.get('quantityToBeTransfered').setValidators(Validators.max(this._sourceProduct.stockQuantity));

        this._sourceProductNumberOfUnitsLabel = this.translateService.instant('TRANSFER_PRODUCT_STOCK_DIALOG.FORM_CONTROL_SECTION.BULK_TO_PIECES_CONTROL.NUMBER_OF_UNITS_CONTROL.LABEL').replace("__PRODUCT_UNIT__", this._sourceProduct.productUnit.name);
        this._sourceProductQuantityToBeTransferedLabel = this.translateService.instant('TRANSFER_PRODUCT_STOCK_DIALOG.FORM_CONTROL_SECTION.BULK_TO_PIECES_CONTROL.NUMBER_OF_STOCKS_TO_BE_TRANSFERED_CONTROL.LABEL').replace("__PRODUCT_UNIT__", this._sourceProduct.productUnit.name);

        this.productService.getProductsByName(this._sourceProduct.name).subscribe((result: {
          endCursor: string,
          hasNextPage: boolean,
          products: Array<Product>,
        }) => {
          this._isLoading = false;
          this._destinationProductOptions = result.products.filter(p => p.code !== this._sourceProduct.code);
        })
      });
  }

  ngOnInit() { }

  onCancel() {
    this._bottomSheetRef.dismiss();
  }

  onConfirm() {

    const transferType = <TransferProductStockTypeEnum>this._transferProductStockForm.get('transferType').value;
    let destinationProductNumberOfUnits = 0;
    let sourceProductNumberOfUnits = 0;
    let sourceNumberOfUnitsTransfered = 0;
    let destinationProductId = 0;

    if (transferType === TransferProductStockTypeEnum.BULK_TO_PIECE) {
      this._bulkToPiecesGroupForm.markAllAsTouched();
      if (!this._bulkToPiecesGroupForm.valid) return;

      destinationProductId = +this._bulkToPiecesGroupForm.get('productDestination').value;
      sourceProductNumberOfUnits = this._bulkToPiecesGroupForm.get('numberOfUnits').value;
      sourceNumberOfUnitsTransfered = this._bulkToPiecesGroupForm.get('quantityToBeTransfered').value;
      destinationProductNumberOfUnits = 0;
    } else {

      this._piecesToBulkGroupForm.markAllAsTouched();
      if (!this._piecesToBulkGroupForm.valid) return;

      destinationProductId = +this._piecesToBulkGroupForm.get('productDestination').value;
      sourceProductNumberOfUnits = 0;
      sourceNumberOfUnitsTransfered = this._piecesToBulkGroupForm.get('quantityToBeTransfered').value;
      destinationProductNumberOfUnits = this._piecesToBulkGroupForm.get('numberOfUnits').value;

      if (sourceNumberOfUnitsTransfered < destinationProductNumberOfUnits) {
        this.dialogService.openAlert(
          this.translateService.instant('TRANSFER_PRODUCT_STOCK_DIALOG.TRANSFER_PRODUCT_STOCK_INVALID_DIALOG.TITLE'),
          this.translateService.instant('TRANSFER_PRODUCT_STOCK_DIALOG.TRANSFER_PRODUCT_STOCK_INVALID_DIALOG.QUANTITY_LESS_THAN_ERROR_MESSAGE'),
        );
        return;
      }

      if (sourceNumberOfUnitsTransfered % destinationProductNumberOfUnits !== 0) {
        this.dialogService.openAlert(
          this.translateService.instant('TRANSFER_PRODUCT_STOCK_DIALOG.TRANSFER_PRODUCT_STOCK_INVALID_DIALOG.TITLE'),
          this.translateService.instant('TRANSFER_PRODUCT_STOCK_DIALOG.TRANSFER_PRODUCT_STOCK_INVALID_DIALOG.QUANTITY_INDIVISIBLE_ERROR_MESSAGE'),
        );
        return;
      }
    }

    const destinationProduct = this._destinationProductOptions.find(p => p.id === destinationProductId);

    let confirmMessage = this.translateService.instant('TRANSFER_PRODUCT_STOCK_DIALOG.TRANSFER_PRODUCT_STOCK_CONFIRMATION_DIALOG.CONFIRM_MESSAGE');
    confirmMessage = confirmMessage.replace("__SOURCE_PRODUCT__", `<strong>${this._sourceProduct.name} ${this._sourceProduct.productUnit.name}</strong>`);
    confirmMessage = confirmMessage.replace("__DESTINATION_PRODUCT__", `<strong>${destinationProduct.name} ${destinationProduct.productUnit.name}</strong>`);

    this.dialogService.openConfirmation(
      this.translateService.instant('TRANSFER_PRODUCT_STOCK_DIALOG.TRANSFER_PRODUCT_STOCK_CONFIRMATION_DIALOG.TITLE'),
      confirmMessage
    ).subscribe((result: ButtonOptions) => {
      if (result === ButtonOptions.YES) {
        this._isLoading = true;
        const userAccountId = +this.storageService.getString('currentSalesAgentId') || this.authService.userId;
        this.productService
          .transferProductStockFromOwnInventory(
            userAccountId,
            this._sourceProduct.id,
            destinationProductId,
            destinationProductNumberOfUnits,
            sourceProductNumberOfUnits,
            sourceNumberOfUnitsTransfered,
            transferType
          )
          .subscribe({
            next: () => {
              this._isLoading = false;
              this.snackBarService.open(
                this.translateService.instant(
                  'TRANSFER_PRODUCT_STOCK_DIALOG.TRANSFER_PRODUCT_STOCK_CONFIRMATION_DIALOG.SUCCESS_MESSAGE'
                ),
                this.translateService.instant('GENERAL_TEXTS.CLOSE')
              )
              this._bottomSheetRef.dismiss(true);
            },
            error: () => {
              this._isLoading = false;
              this.snackBarService.open(
                this.translateService.instant(
                  'TRANSFER_PRODUCT_STOCK_DIALOG.TRANSFER_PRODUCT_STOCK_CONFIRMATION_DIALOG.ERROR_MESSAGE'
                ),
                this.translateService.instant('GENERAL_TEXTS.CLOSE')
              )
            }
          });
      }
    });
  }

  get transferProductStockForm(): FormGroup {
    return this._transferProductStockForm;
  }

  get bulkToPiecesGroupForm(): FormGroup {
    return this._bulkToPiecesGroupForm;
  }

  get piecesToBulkGroupForm(): FormGroup {
    return this._piecesToBulkGroupForm;
  }

  get destinationProductOptionsArray(): Array<Product> {
    return this._destinationProductOptions;
  }

  get transferProductTypeOptionsArray(): Array<{ key: string; value: string }> {
    return this._transferProductTypeOptionsArray;
  }

  get sourceProductQuantityToBeTransferedLabel(): string {
    return this._sourceProductQuantityToBeTransferedLabel;
  }

  get sourceProductNumberOfUnitsLabel(): string {
    return this._sourceProductNumberOfUnitsLabel;
  }

  get destinationProductNumberOfUnitsLabel(): string {
    return this._destinationProductNumberOfUnitsLabel;
  }

  get sourceProduct(): Product {
    return this._sourceProduct;
  }
}
