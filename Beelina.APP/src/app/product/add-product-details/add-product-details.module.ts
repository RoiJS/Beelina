import { NgModule } from '@angular/core';

import { AddProductDetailsComponent } from './add-product-details.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: AddProductDetailsComponent,
        title: 'ADD_PRODUCT_DETAILS_PAGE.TITLE',
      },
    ]),
  ],
  declarations: [AddProductDetailsComponent],
})
export class AddProductDetailsModule {}
