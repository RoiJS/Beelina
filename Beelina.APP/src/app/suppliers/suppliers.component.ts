import { Component, OnDestroy, OnInit, inject } from '@angular/core';

import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { Supplier } from '../_models/supplier';
import { BaseComponent } from '../shared/components/base-component/base.component';
import { ManageSupplierComponent } from './manage-supplier/manage-supplier.component';
import { DialogService } from '../shared/ui/dialog/dialog.service';
import { NotificationService } from '../shared/ui/notification/notification.service';
import { SupplierService } from '../_services/supplier.service';
import { SupplierStore } from './suppliers.store';
import { SuppliersDataSource } from '../_models/datasources/suppliers.datasource';

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.scss'],
})
export class SuppliersComponent extends BaseComponent implements OnInit, OnDestroy {

  dataSource: SuppliersDataSource;

  bottomSheet = inject(MatBottomSheet);
  dialogService = inject(DialogService);
  notificationService = inject(NotificationService);
  route = inject(Router);
  supplierService = inject(SupplierService);
  supplierStore = inject(SupplierStore);
  translateService = inject(TranslateService);

  private _manageBarangayDialogRef: any;

  constructor() {
    super();
    this.dataSource = new SuppliersDataSource();
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.supplierStore.reset();
  }

  onSearch(filterKeyword: string) {
    this.supplierStore.reset();
    this.supplierStore.setSearchSuppliers(filterKeyword);
    this.supplierStore.getSuppliers();
  }

  onClear() {
    this.onSearch('');
  }

  addSupplier() {
    this.openSupplierDialog(new Supplier());
  }

  updateSupplier(barangay: Supplier) {
    this.openSupplierDialog(barangay);
  }

  deleteSupplier(id: number) {
    this.dialogService
      .openConfirmation(
        this.translateService.instant(
          'SUPPLIERS_PAGE.DELETE_SUPPLIERS_DIALOG.TITLE'
        ),
        this.translateService.instant(
          'SUPPLIERS_PAGE.DELETE_SUPPLIERS_DIALOG.CONFIRM'
        )
      )
      .subscribe((result) => {
        if (result) {
          this.supplierService.deleteSuppliers([id]).subscribe({
            complete: () => {
              this.notificationService.openSuccessNotification(this.translateService.instant(
                'SUPPLIERS_PAGE.DELETE_SUPPLIERS_DIALOG.SUCCESS_MESSAGE'
              ));
              this.supplierStore.resetList();
              this.supplierStore.getSuppliers();
            },
            error: (err) => {
              this.notificationService.openErrorNotification(this.translateService.instant(
                'SUPPLIERS_PAGE.DELETE_SUPPLIERS_DIALOG.ERROR_MESSAGE'
              ));
            },
          });
        }
      });
  }

  private openSupplierDialog(supplier: Supplier) {
    if (this._manageBarangayDialogRef) this._manageBarangayDialogRef = null;

    this._manageBarangayDialogRef = this.bottomSheet.open(
      ManageSupplierComponent,
      {
        data: { supplier },
      }
    );

    this._manageBarangayDialogRef
      .afterDismissed()
      .subscribe((data: boolean) => {
        if (data) {
          this.supplierStore.resetList();
          this.supplierStore.getSuppliers();
        }
      });
  }
}
