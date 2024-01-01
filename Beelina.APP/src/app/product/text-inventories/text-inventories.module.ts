import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { EffectsModule } from '@ngrx/effects';

import * as ProductReducers from '../../product/store/reducers';
import { CustomUISharedModule } from 'src/app/shared/custom-ui-shared.module';
import { ProductEffects } from '../store/effects';
import { TextInventoriesComponent } from './text-inventories.component';

@NgModule({
  imports: [
    CommonModule,
    CustomUISharedModule,
    ReactiveFormsModule,
    MatIconModule,
    MatInputModule,
    TranslateModule.forChild(),
    RouterModule.forChild([
      {
        path: '',
        component: TextInventoriesComponent
      }
    ]),
    EffectsModule.forFeature([
      ProductEffects
    ]),
    StoreModule.forFeature('products', ProductReducers.reducers),
  ],
  declarations: [TextInventoriesComponent],
})
export class TextInventoriesModule { }
