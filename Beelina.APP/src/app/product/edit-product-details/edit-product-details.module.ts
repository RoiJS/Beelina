import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { EditProductDetailsComponent } from './edit-product-details.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: EditProductDetailsComponent,
        title: 'EDIT_PRODUCT_DETAILS_PAGE.TITLE',
      },
    ]),
  ],
  declarations: [EditProductDetailsComponent],
})
export class EditProductDetailsModule {}
