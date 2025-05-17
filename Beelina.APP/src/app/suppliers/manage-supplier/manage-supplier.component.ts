import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { TranslateService } from '@ngx-translate/core';

import { ButtonOptions } from 'src/app/_enum/button-options.enum';
import { Supplier } from 'src/app/_models/supplier';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { NotificationService } from 'src/app/shared/ui/notification/notification.service';
import { SupplierService } from 'src/app/_services/supplier.service';
import { UniqueSupplierCodeValidator } from 'src/app/_validators/unique-supplier-code.validator';

@Component({
  selector: 'app-manage-supplier',
  templateUrl: './manage-supplier.component.html',
  styleUrls: ['./manage-supplier.component.scss']
})
export class ManageSupplierComponent implements OnInit {

  private _supplierForm: FormGroup;
  private _dialogTitle: string;
  private _dialogConfirmationMessage: string;
  private _dialogSuccessMessage: string;
  private _dialogErrorMessage: string;

  private bottomSheetRef = inject(MatBottomSheetRef<ManageSupplierComponent>);
  private barangayService = inject(SupplierService);
  private dialogService = inject(DialogService);
  private formBuilder = inject(FormBuilder);
  private notificationService = inject(NotificationService);
  private translateService = inject(TranslateService);
  private uniqueSupplierCodeValidator = inject(UniqueSupplierCodeValidator);

  data = inject<{ supplier: Supplier }>(MAT_BOTTOM_SHEET_DATA);

  constructor() {

    this.uniqueSupplierCodeValidator.supplierId = this.data.supplier.id;
    this.setUpLanguageTexts(this.data.supplier.id === 0);

    this._supplierForm = this.formBuilder.group({
      code: [
        this.data.supplier.code,
        [Validators.required],
        [
          this.uniqueSupplierCodeValidator.validate.bind(
            this.uniqueSupplierCodeValidator
          ),
        ],
      ],
      name: [this.data.supplier.name, [Validators.required]],
    },
      {
        updateOn: 'blur',
      });
  }

  ngOnInit() { }

  onSave() {
    this._supplierForm.markAllAsTouched();

    if (this._supplierForm.valid) {
      const name = this._supplierForm.get('name').value;
      const code = this._supplierForm.get('code').value;

      const id = this.data.supplier.id;
      const manageSupplier = new Supplier();
      manageSupplier.name = name;
      manageSupplier.code = code;
      manageSupplier.id = id;

      this.dialogService
        .openConfirmation(this.dialogTitle, this._dialogConfirmationMessage)
        .subscribe((result: ButtonOptions) => {
          if (result === ButtonOptions.YES) {
            this.barangayService.updateSupplier(manageSupplier).subscribe({
              complete: () => {
                this.notificationService.openSuccessNotification(this._dialogSuccessMessage);
                this.bottomSheetRef.dismiss(true);
              },
              error: (err) => {
                this.notificationService.openErrorNotification(this._dialogErrorMessage);
                this.bottomSheetRef.dismiss(false);
              },
            });
          }
        });
    }
  }

  onCancel() {
    this.bottomSheetRef.dismiss();
  }

  private setUpLanguageTexts(forNewSupplier: boolean) {
    if (forNewSupplier) {
      this._dialogTitle = this.translateService.instant(
        'SUPPLIERS_PAGE.ADD_SUPPLIER_DIALOG.TITLE'
      );
      this._dialogConfirmationMessage = this.translateService.instant(
        'SUPPLIERS_PAGE.ADD_SUPPLIER_DIALOG.CONFIRM'
      );
      this._dialogSuccessMessage = this.translateService.instant(
        'SUPPLIERS_PAGE.ADD_SUPPLIER_DIALOG.SUCCESS_MESSAGE'
      );
      this._dialogErrorMessage = this.translateService.instant(
        'SUPPLIERS_PAGE.ADD_SUPPLIER_DIALOG.ERROR_MESSAGE'
      );
    } else {
      this._dialogTitle = this.translateService.instant(
        'SUPPLIERS_PAGE.UPDATE_SUPPLIER_DIALOG.TITLE'
      );
      this._dialogConfirmationMessage = this.translateService.instant(
        'SUPPLIERS_PAGE.UPDATE_SUPPLIER_DIALOG.CONFIRM'
      );
      this._dialogSuccessMessage = this.translateService.instant(
        'SUPPLIERS_PAGE.UPDATE_SUPPLIER_DIALOG.SUCCESS_MESSAGE'
      );
      this._dialogErrorMessage = this.translateService.instant(
        'SUPPLIERS_PAGE.UPDATE_SUPPLIER_DIALOG.ERROR_MESSAGE'
      );
    }
  }

  get dialogTitle(): string {
    return this._dialogTitle;
  }

  get supplierForm(): FormGroup {
    return this._supplierForm;
  }

}
