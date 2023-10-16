import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { AppStateInterface } from '../_interfaces/app-state.interface';
import { BarangaysDataSource } from '../_models/datasources/barangays.datasource';
import { isLoadingSelector } from '../barangays/store/selectors';
import { BaseComponent } from '../shared/components/base-component/base.component';

import { BarangayService } from '../_services/barangay.service';
import { DialogService } from '../shared/ui/dialog/dialog.service';

import { Barangay } from '../_models/barangay';
import * as BarangaysStoreActions from '../barangays/store/actions';
import { ManageBarangayComponent } from './manage-barangay/manage-barangay.component';

@Component({
  selector: 'app-barangays',
  templateUrl: './barangays.component.html',
  styleUrls: ['./barangays.component.scss'],
})
export class BarangaysComponent
  extends BaseComponent
  implements OnInit, OnDestroy
{
  private _searchForm: FormGroup;
  private _dataSource: BarangaysDataSource;

  $isLoading: Observable<boolean>;
  private _manageBarangayDialogRef: any;

  constructor(
    private barangayService: BarangayService,
    private bottomSheet: MatBottomSheet,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBarService: MatSnackBar,
    private store: Store<AppStateInterface>,
    private translateService: TranslateService
  ) {
    super();
    this._dataSource = new BarangaysDataSource(this.store);

    this._searchForm = this.formBuilder.group({
      filterKeyword: [''],
    });

    this.$isLoading = this.store.pipe(select(isLoadingSelector));
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.store.dispatch(BarangaysStoreActions.resetBarangayState());
  }

  onSearch() {
    const filterKeyword = this._searchForm.get('filterKeyword').value;
    this.store.dispatch(BarangaysStoreActions.resetBarangayState());
    this.store.dispatch(
      BarangaysStoreActions.setSearchBarangaysAction({ keyword: filterKeyword })
    );
    this.store.dispatch(BarangaysStoreActions.getBarangaysAction());
  }

  addBarangay() {
    this.openBarangayDialog(new Barangay());
  }

  updateBarangay(barangay: Barangay) {
    this.openBarangayDialog(barangay);
  }

  private openBarangayDialog(barangay: Barangay) {
    if (this._manageBarangayDialogRef) this._manageBarangayDialogRef = null;

    this._manageBarangayDialogRef = this.bottomSheet.open(
      ManageBarangayComponent,
      {
        data: { barangay },
      }
    );

    this._manageBarangayDialogRef
      .afterDismissed()
      .subscribe((data: Barangay) => {
        if (data) {
          this.store.dispatch(BarangaysStoreActions.resetBarangayList());
          this.store.dispatch(BarangaysStoreActions.getBarangaysAction());
        }
      });
  }

  deleteBarangay(id: number) {
    this.dialogService
      .openConfirmation(
        this.translateService.instant(
          'BARANGAYS_PAGE.DELETE_BARANGAY_DIALOG.TITLE'
        ),
        this.translateService.instant(
          'BARANGAYS_PAGE.DELETE_BARANGAY_DIALOG.CONFIRM'
        )
      )
      .subscribe((result) => {
        if (result) {
          this.barangayService.deleteBarangay(id).subscribe({
            complete: () => {
              this.snackBarService.open(
                this.translateService.instant(
                  'BARANGAYS_PAGE.DELETE_BARANGAY_DIALOG.SUCCESS_MESSAGE'
                ),
                this.translateService.instant('GENERAL_TEXTS.CLOSE'),
                {
                  duration: 5000,
                }
              );

              this.store.dispatch(BarangaysStoreActions.resetBarangayList());
              this.store.dispatch(BarangaysStoreActions.getBarangaysAction());
            },
            error: (err) => {
              this.snackBarService.open(
                this.translateService.instant(
                  'BARANGAYS_PAGE.DELETE_BARANGAY_DIALOG.ERROR_MESSAGE'
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

  goToCustomers(barangay: string) {
    this.router.navigate([`barangays/${barangay}`]);
  }

  get dataSource(): BarangaysDataSource {
    return this._dataSource;
  }

  get searchForm(): FormGroup {
    return this._searchForm;
  }
}
