import { NgModule } from '@angular/core';

import { ProductComponent } from './product.component';
import { ProductRoutingModule } from './product.routing.module';

import { SharedModule } from '../shared/shared.module';
import { TopProductsComponent } from './top-products/top-products.component';

@NgModule({
  imports: [SharedModule, ProductRoutingModule],
  declarations: [ProductComponent, TopProductsComponent],
})
export class ProductModule {}
