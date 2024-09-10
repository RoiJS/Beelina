import { inject, Injectable } from '@angular/core';
import { from } from 'rxjs';

import { ProductService } from './product.service';
import { LocalProductsDbService } from './local-db/local-products-db.service';

@Injectable({
  providedIn: 'root'
})
export class ProductDataService {

  productService = inject(ProductService);
  localProductDbService = inject(LocalProductsDbService);

  getProduct(productId: number) {

    if (!navigator.onLine) {
      return from(this.localProductDbService.getMyLocalProductById(productId));
    }

    return this.productService.getProduct(productId);
  }

}
