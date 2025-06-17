import { AfterViewInit, Component, effect, inject, OnInit, signal, viewChild } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { ProductWithdrawalFilter } from '../_models/filters/product-withdrawal.filter';
import { ProductWithdrawalEntry } from '../_models/product-withdrawal-entry';
import { ProductService } from '../_services/product.service';
import { DialogService } from '../shared/ui/dialog/dialog.service';
import { NotificationService } from '../shared/ui/notification/notification.service';
import { ProductWithdrawalEntriesStore } from './product-withdrawal-entries.store';
import { SortOrderOptionsEnum } from '../_enum/sort-order-options.enum';
import { ProductWithdrawalFilterComponent } from './product-withdrawal-filter/product-withdrawal-filter.component';
import { DateFormatter } from '../_helpers/formatters/date-formatter.helper';
import { ButtonOptions } from '../_enum/button-options.enum';

@Component({
  selector: 'app-product-withdrawals',
  templateUrl: './product-withdrawals.component.html',
  styleUrls: ['./product-withdrawals.component.scss']
})
export class ProductWithdrawalsComponent implements AfterViewInit {
  productWithdrawalEntriesStore = inject(ProductWithdrawalEntriesStore);

  bottomSheet = inject(MatBottomSheet);
  dialogService = inject(DialogService);
  notificationService = inject(NotificationService);

  router = inject(Router);
  dataSource: ProductWithdrawalEntry[] = [];
  productWithdrawalFilter = signal<ProductWithdrawalFilter>(new ProductWithdrawalFilter());

  productService = inject(ProductService);
  translateService = inject(TranslateService);

  paginator = viewChild(MatPaginator);
  sort = viewChild(MatSort);

  _dialogOpenFilterRef: MatBottomSheetRef<
    ProductWithdrawalFilterComponent,
    {
      startDate: Date;
      endDate: Date;
    }
  >;

  constructor() {
    effect(() => {
      this.dataSource = this.productWithdrawalEntriesStore.productWithdrawalEntries();
    });
  }


  ngAfterViewInit() {
    this.productWithdrawalEntriesStore.setSort(this.sort().active, <SortOrderOptionsEnum>this.sort().direction.toUpperCase());
    this.productWithdrawalEntriesStore.setPagination(this.paginator().pageIndex, this.paginator().pageSize);
    this.productWithdrawalEntriesStore.getProductWithdrawalEntries();
  }

  onPageChange(e: PageEvent) {
    if (this.productWithdrawalEntriesStore.take() !== e.pageSize) {
      this.productWithdrawalEntriesStore.setPagination(0, e.pageSize);
    } else {
      this.productWithdrawalEntriesStore.setPagination(e.pageIndex * e.pageSize, e.pageSize);
    }

    this.productWithdrawalEntriesStore.getProductWithdrawalEntries();
  }

  onSearch(filterKeyword: string) {
    this.productWithdrawalEntriesStore.reset();
    this.productWithdrawalEntriesStore.setSearchFilterKeyword(filterKeyword);
    this.productWithdrawalEntriesStore.setSort(this.sort().active, <SortOrderOptionsEnum>this.sort().direction.toUpperCase());
    this.productWithdrawalEntriesStore.getProductWithdrawalEntries();
  }

  onClear() {
    this.onSearch('');
  }

  onSortChange(e: Sort) {
    this.productWithdrawalEntriesStore.setSort(this.sort().active, <SortOrderOptionsEnum>this.sort().direction.toUpperCase());
    this.productWithdrawalEntriesStore.getProductWithdrawalEntries();
  }

  openFilter() {
    this._dialogOpenFilterRef = this.bottomSheet.open(ProductWithdrawalFilterComponent, {
      data: this.productWithdrawalFilter()
    });

    this._dialogOpenFilterRef
      .afterDismissed()
      .subscribe(
        (data: {
          endDate: Date;
          startDate: Date;
        }) => {
          if (!data) return;

          this.productWithdrawalFilter.update(() => {
            const productWithdrawalFilter = new ProductWithdrawalFilter();
            productWithdrawalFilter.startDate = DateFormatter.format(data.startDate);
            productWithdrawalFilter.endDate = DateFormatter.format(data.endDate);
            return productWithdrawalFilter;
          });

          this.productWithdrawalEntriesStore.resetList();
          this.productWithdrawalEntriesStore.setDateFilters(this.productWithdrawalFilter().startDate, this.productWithdrawalFilter().endDate);
          this.productWithdrawalEntriesStore.getProductWithdrawalEntries();
        });
  }

  goToProductWithdrawal(id: number) {
    this.router.navigate([`product-withdrawals/${id}`]);
  }

  addNewProductWithdrawal() {
    this.router.navigate([`product-withdrawals/add`]);
  }

  removeProductWithdrawal(id: number) {
    this.dialogService
      .openConfirmation(
        this.translateService.instant("PRODUCT_WITHDRAWALS_PAGE.DELETE_PRODUCT_WITHDRAWAL_DIALOG.TITLE"),
        this.translateService.instant("PRODUCT_WITHDRAWALS_PAGE.DELETE_PRODUCT_WITHDRAWAL_DIALOG.CONFIRM_MESSAGE")
      )
      .subscribe((result: ButtonOptions) => {
        if (result == ButtonOptions.YES) {
          this.productService
            .deleteProductWithdrawalEntry(id)
            .subscribe({
              next: () => {
                this.notificationService.openSuccessNotification(this.translateService.instant("PRODUCT_WITHDRAWALS_PAGE.DELETE_PRODUCT_WITHDRAWAL_DIALOG.SUCCESS_MESSAGE"));
                this.productWithdrawalEntriesStore.getProductWithdrawalEntries();
              },
              error: () => {
                this.notificationService.openSuccessNotification(this.translateService.instant("PRODUCT_WITHDRAWALS_PAGE.DELETE_PRODUCT_WITHDRAWAL_DIALOG.ERROR_MESSAGE"));
              }
            })
        }
      });
  }

  get columnDefinition(): string[] {
    return ['stockEntryDate', 'withdrawalSlipNo', 'salesAgent', 'notes', 'actions'];
  }
}
