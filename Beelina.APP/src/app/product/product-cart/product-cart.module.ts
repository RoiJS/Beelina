import { NgModule } from '@angular/core';

import { ProductCartComponent } from './product-cart.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: ProductCartComponent,
      },
    ]),
  ],
  declarations: [ProductCartComponent],
})
export class ProductCartModule {}
