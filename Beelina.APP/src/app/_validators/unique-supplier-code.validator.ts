import { inject, Injectable } from '@angular/core';
import {
  AbstractControl,
  AsyncValidator,
  ValidationErrors,
} from '@angular/forms';
import { catchError, map, Observable, of, take } from 'rxjs';

import { SupplierService } from '../_services/supplier.service';

@Injectable({ providedIn: 'root' })
export class UniqueSupplierCodeValidator implements AsyncValidator {
  supplierId: number = 0;

  private supplierService = inject(SupplierService);

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    return this.supplierService
      .checkSupplierCodeExists(this.supplierId, control.value)
      .pipe(
        take(1),
        map((isTaken) => (isTaken ? { supplierAlreadyExists: true } : null)),
        catchError(() => of(null))
      );
  }
}
