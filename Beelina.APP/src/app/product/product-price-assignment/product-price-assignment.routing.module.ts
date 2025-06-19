import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductPriceAssignmentComponent } from './product-price-assignment.component';

const routes: Routes = [
  {
    path: '',
    component: ProductPriceAssignmentComponent,
    title: 'PRODUCT_PRICE_ASSIGNMENT.TITLE',
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductPriceAssignmentRoutingModule { }
