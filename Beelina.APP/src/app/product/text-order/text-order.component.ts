import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';

import * as ProductActions from '../store/actions';

@Component({
  selector: 'app-text-order',
  templateUrl: './text-order.component.html',
  styleUrls: ['./text-order.component.scss'],
})
export class TextOrderComponent implements OnInit {
  private _orderForm: FormGroup;
  private _hintLabelText1: string;
  private _hintLabelText2: string;

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<TextOrderComponent>,
    private formBuilder: FormBuilder,
    private router: Router,
    private store: Store<AppStateInterface>,
    private translateService: TranslateService
  ) {
    this._orderForm = this.formBuilder.group({
      textOrder: ['', Validators.required],
    });

    this._hintLabelText1 = this.translateService.instant(
      'TEXT_ORDER_DIALOG.FORM_CONTROL_SECTION.TEXT_ORDER_CONTROL.HINT_LABEL_1'
    );
    this._hintLabelText2 = this.translateService.instant(
      'TEXT_ORDER_DIALOG.FORM_CONTROL_SECTION.TEXT_ORDER_CONTROL.HINT_LABEL_2'
    );
  }

  ngOnInit() {}

  setOrder() {
    const textOrders = this._orderForm.get('textOrder').value;
    this.store.dispatch(ProductActions.analyzeTextOrders({ textOrders }));
    this.router.navigate([`product-catalogue/product-cart`]);
    this._bottomSheetRef.dismiss();
  }

  get orderForm(): FormGroup {
    return this._orderForm;
  }

  get hintLabelText1() {
    return this._hintLabelText1;
  }

  get hintLabelText2() {
    return this._hintLabelText2;
  }
}
