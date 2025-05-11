import { inject, Injectable } from '@angular/core';
import {
  AbstractControl,
  AsyncValidator,
  ValidationErrors,
} from '@angular/forms';
import { catchError, map, Observable, of, take } from 'rxjs';

import { ProductService } from '../_services/product.service';

@Injectable({ providedIn: 'root' })
export class UniqueProductWithdrawalCodeValidator implements AsyncValidator {
  productWithdrawalId: number = 0;

  private productService = inject(ProductService);

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    return this.productService
      .checkProductWithdrawalCodeExists(this.productWithdrawalId, control.value)
      .pipe(
        take(1),
        map((isTaken) => (isTaken ? { productWithdrawalAlreadyExists: true } : null)),
        catchError(() => of(null))
      );
  }
}
