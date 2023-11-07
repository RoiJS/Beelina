import { Injectable } from '@angular/core';
import {
  AbstractControl,
  AsyncValidator,
  ValidationErrors,
} from '@angular/forms';
import { catchError, map, Observable, of, take } from 'rxjs';

import { AuthService } from '../_services/auth.service';

@Injectable({ providedIn: 'root' })
export class UniqueUsernameValidator implements AsyncValidator {
  userId: number = 0;

  constructor(private authService: AuthService) {}

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    return this.authService
      .checkUsernameExists(this.userId, control.value)
      .pipe(
        take(1),
        map((isTaken) => (isTaken ? { usernameAlreadyExists: true } : null)),
        catchError(() => of(null))
      );
  }
}
