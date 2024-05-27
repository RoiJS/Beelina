import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { TranslateService } from '@ngx-translate/core';

import { ButtonOptions } from 'src/app/_enum/button-options.enum';
import { Supplier } from 'src/app/_models/supplier';
import { SupplierService } from 'src/app/_services/supplier.service';
import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { NotificationService } from 'src/app/shared/ui/notification/notification.service';

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

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<ManageSupplierComponent>,
    private barangayService: SupplierService,
    private dialogService: DialogService,
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: {
      supplier: Supplier;
    },
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private translateService: TranslateService
  ) {
    this.setUpLanguageTexts(this.data.supplier.id === 0);

    this._supplierForm = this.formBuilder.group({
      code: [data.supplier.code, [Validators.required]],
      name: [data.supplier.name, [Validators.required]],
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
                this._bottomSheetRef.dismiss(true);
              },
              error: (err) => {
                this.notificationService.openErrorNotification(this._dialogErrorMessage);
                this._bottomSheetRef.dismiss(false);
              },
            });
          }
        });
    }
  }

  onCancel() {
    this._bottomSheetRef.dismiss();
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
