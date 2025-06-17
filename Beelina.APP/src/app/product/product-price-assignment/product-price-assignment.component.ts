import { AfterViewInit, Component, effect, inject, signal, viewChild } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { TranslateService } from '@ngx-translate/core';

import { ButtonOptions } from 'src/app/_enum/button-options.enum';
import { PriceStatusEnum } from 'src/app/_enum/price-status.enum';
import { StockStatusEnum } from 'src/app/_enum/stock-status.enum';
import { SortOrderOptionsEnum } from '../../_enum/sort-order-options.enum';

import { DialogService } from 'src/app/shared/ui/dialog/dialog.service';
import { NotificationService } from 'src/app/shared/ui/notification/notification.service';
import { Product } from 'src/app/_models/product';
import { ProductService } from 'src/app/_services/product.service';
import { StorageService } from 'src/app/_services/storage.service';

import { ProductsFilter } from '../../_models/filters/products.filter';

import { ProductPriceAssignmentsStore } from './product-price-assignments.store';
import { ProductFilterComponent } from '../product-filter/product-filter.component';
import { CopyPriceAssignmentDialogComponent } from './copy-price-assignment-dialog.component';

@Component({
  selector: 'app-product-price-assignment',
  templateUrl: './product-price-assignment.component.html',
  styleUrls: ['./product-price-assignment.component.scss']
})
export class ProductPriceAssignmentComponent implements AfterViewInit {
  paginator = viewChild(MatPaginator);
  sort = viewChild(MatSort);

  dataSource = signal<Product[]>([]);
  displayedColumns: string[] = ['name', 'code', 'unit', 'stockQuantity', 'pricePerUnit', 'actions'];
  modifiedProducts = signal<Map<number, Product>>(new Map());
  removedProducts = signal<Set<number>>(new Set());
  productsFilter = signal<ProductsFilter>(new ProductsFilter());

  productPriceAssignmentsStore = inject(ProductPriceAssignmentsStore);
  storageService = inject(StorageService);
  bottomSheet = inject(MatBottomSheet);
  translateService = inject(TranslateService);
  dialogService = inject(DialogService);
  notificationService = inject(NotificationService);
  productService = inject(ProductService);

  _dialogOpenFilterRef: MatBottomSheetRef<
    ProductFilterComponent, {
      supplierId: number;
      stockStatus: StockStatusEnum;
      priceStatus: PriceStatusEnum;
    }
  >;

  constructor() {
    effect(() => {
      const assignments = this.productPriceAssignmentsStore.productAssignments();
      this.dataSource.set(assignments);
    }, { allowSignalWrites: true });
  }

  ngAfterViewInit() {
    this.productPriceAssignmentsStore.reset();
    const currentSalesAgentId = +this.storageService.getString('currentSalesAgentId');

    this.productPriceAssignmentsStore.setSort(
      this.sort()?.active,
      <SortOrderOptionsEnum>this.sort()?.direction.toUpperCase()
    );
    this.productPriceAssignmentsStore.setPagination(
      this.paginator()?.pageIndex,
      this.paginator()?.pageSize
    );

    this.productPriceAssignmentsStore.setUserAccountId(currentSalesAgentId);
    this.productPriceAssignmentsStore.getProductAssignments();
  }

  onPageChange(e: PageEvent) {
    if (this.productPriceAssignmentsStore.take() !== e.pageSize) {
      this.productPriceAssignmentsStore.setPagination(0, e.pageSize);
    } else {
      this.productPriceAssignmentsStore.setPagination(e.pageIndex * e.pageSize, e.pageSize);
    }
    this.productPriceAssignmentsStore.getProductAssignments();
  }

  onSortChange(e: Sort) {
    this.productPriceAssignmentsStore.setSort(
      this.sort()?.active,
      <SortOrderOptionsEnum>this.sort()?.direction.toUpperCase()
    );
    this.productPriceAssignmentsStore.getProductAssignments();
  }

  onSearch(keyword: string) {
    this.productPriceAssignmentsStore.setSearchFilterKeyword(keyword);
    this.productPriceAssignmentsStore.getProductAssignments();
  }

  onClear() {
    this.onSearch('');
  }

  openFilter() {
    const defaultProductsFilter = new ProductsFilter();
    defaultProductsFilter.supplierId = 0;
    defaultProductsFilter.stockStatus = StockStatusEnum.None;
    defaultProductsFilter.priceStatus = PriceStatusEnum.None;

    this._dialogOpenFilterRef = this.bottomSheet.open(ProductFilterComponent, {
      data: {
        defaultProductsFilter: defaultProductsFilter,
        currentProductsFilter: this.productsFilter()
      }
    });

    this._dialogOpenFilterRef
      .afterDismissed()
      .subscribe(
        (data: {
          supplierId: number,
          stockStatus: StockStatusEnum,
          priceStatus: PriceStatusEnum
        }) => {
          if (!data) return;

          const productsFilter = new ProductsFilter();
          productsFilter.supplierId = data.supplierId;
          productsFilter.stockStatus = data.stockStatus;
          productsFilter.priceStatus = data.priceStatus;
          this.productsFilter.set(productsFilter);

          this.productPriceAssignmentsStore.reset();
          this.productPriceAssignmentsStore.setSort(
            this.sort()?.active,
            <SortOrderOptionsEnum>this.sort()?.direction.toUpperCase()
          );
          this.productPriceAssignmentsStore.setProductsFilter(this.productsFilter());
          this.productPriceAssignmentsStore.getProductAssignments();
        });
  }

  onPriceChange(product: Product) {
    this.modifiedProducts.update(products => {
      const updatedProducts = new Map(products);
      updatedProducts.set(product.id, product);
      return updatedProducts;
    });
  }

  getModifiedProducts(): Product[] {
    return Array.from(this.modifiedProducts().values());
  }

  hasModifiedProducts(): boolean {
    return this.modifiedProducts().size > 0;
  }

  clearModifiedProducts() {
    this.modifiedProducts.set(new Map());
  }

  removeProduct(product: Product) {
    this.dialogService
      .openConfirmation(
        this.translateService.instant('PRODUCT_PRICE_ASSIGNMENT.REMOVE_PRODUCT_DIALOG.TITLE'),
        this.translateService.instant('PRODUCT_PRICE_ASSIGNMENT.REMOVE_PRODUCT_DIALOG.CONFIRM_MESSAGE', { name: product.name })
      )
      .subscribe((result: ButtonOptions) => {
        if (result === ButtonOptions.YES) {
          this.removedProducts.update(products => {
            const updatedProducts = new Set(products);
            updatedProducts.add(product.id);
            return updatedProducts;
          });

          // Remove from modified products if it was there
          this.modifiedProducts.update(products => {
            const updatedProducts = new Map(products);
            updatedProducts.delete(product.id);
            return updatedProducts;
          });

          // Update the data source to remove the product
          this.dataSource.update(products =>
            products.filter(p => p.id !== product.id)
          );

          this.notificationService.openSuccessNotification(
            this.translateService.instant('PRODUCT_PRICE_ASSIGNMENT.REMOVE_PRODUCT_DIALOG.SUCCESS_MESSAGE')
          );
        }
      });
  }

  getRemovedProducts(): number[] {
    return Array.from(this.removedProducts().values());
  }

  clearRemovedProducts() {
    this.removedProducts.set(new Set());
  }

  saveChanges() {
    const modifiedProducts = this.getModifiedProducts();
    const removedProducts = this.getRemovedProducts();

    if (modifiedProducts.length === 0 && removedProducts.length === 0) {
      return;
    }

    this.dialogService
      .openConfirmation(
        this.translateService.instant('PRODUCT_PRICE_ASSIGNMENT.SAVE_CHANGES_DIALOG.TITLE'),
        this.translateService.instant('PRODUCT_PRICE_ASSIGNMENT.SAVE_CHANGES_DIALOG.CONFIRM_MESSAGE')
      )
      .subscribe((result: ButtonOptions) => {
        if (result === ButtonOptions.YES) {
          this.productService.updateProductPriceAssignments(modifiedProducts, removedProducts)
            .subscribe({
              next: () => {
                this.notificationService.openSuccessNotification(
                  this.translateService.instant('PRODUCT_PRICE_ASSIGNMENT.SAVE_CHANGES_DIALOG.SUCCESS_MESSAGE')
                );
                this.clearModifiedProducts();
                this.clearRemovedProducts();
                this.productPriceAssignmentsStore.getProductAssignments();
              },
              error: (error) => {
                this.notificationService.openErrorNotification(
                  this.translateService.instant('PRODUCT_PRICE_ASSIGNMENT.SAVE_CHANGES_DIALOG.ERROR_MESSAGE')
                );
                console.error('Error updating product assignments:', error);
              }
            });
        }
      });
  }

  openCopyPriceAssignmentDialog() {
    this.bottomSheet.open(CopyPriceAssignmentDialogComponent)
      .afterDismissed()
      .subscribe((selectedAgentId: number) => {
        if (selectedAgentId) {
          this.dialogService.openConfirmation(
            this.translateService.instant('COPY_PRODUCT_PRICE_DIALOG.CONFIRM_TITLE'),
            this.translateService.instant('COPY_PRODUCT_PRICE_DIALOG.CONFIRM_MESSAGE')
          ).subscribe((result: ButtonOptions) => {
            if (result === ButtonOptions.YES) {
              const currentSalesAgentId = +this.storageService.getString('currentSalesAgentId');
              this.productService.copyProductPriceAssignments(selectedAgentId, currentSalesAgentId)
                .subscribe({
                  next: () => {
                    this.notificationService.openSuccessNotification(
                      this.translateService.instant('COPY_PRODUCT_PRICE_DIALOG.SUCCESS_MESSAGE')
                    );
                    this.productPriceAssignmentsStore.getProductAssignments();
                  },
                  error: (error) => {
                    this.notificationService.openErrorNotification(
                      this.translateService.instant('COPY_PRODUCT_PRICE_DIALOG.ERROR_MESSAGE')
                    );
                    console.error('Error copying product assignments:', error);
                  }
                });
            }
          });
        }
      });
  }
}
