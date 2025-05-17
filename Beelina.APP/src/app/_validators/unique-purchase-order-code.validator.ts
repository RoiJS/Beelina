import { inject, Injectable } from '@angular/core';
import {
  AbstractControl,
  AsyncValidator,
  ValidationErrors,
} from '@angular/forms';
import { catchError, map, Observable, of, take } from 'rxjs';

import { ProductService } from '../_services/product.service';

@Injectable({ providedIn: 'root' })
export class UniquePurchaseOrderCodeValidator implements AsyncValidator {
  purchaseOrderId: number = 0;

  private productService = inject(ProductService);

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    return this.productService
      .checkPurchaseOrderCodeExists(this.purchaseOrderId, control.value)
      .pipe(
        take(1),
        map((isTaken) => (isTaken ? { purchaseOrderAlreadyExists: true } : null)),
        catchError(() => of(null))
      );
  }
}
