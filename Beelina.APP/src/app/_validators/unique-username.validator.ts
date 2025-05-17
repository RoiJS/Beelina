import { inject, Injectable } from '@angular/core';
import {
  AbstractControl,
  AsyncValidator,
  ValidationErrors,
} from '@angular/forms';
import { catchError, map, Observable, of, take } from 'rxjs';

import { UserAccountService } from '../_services/user-account.service';

@Injectable({ providedIn: 'root' })
export class UniqueUsernameValidator implements AsyncValidator {
  userId: number = 0;

  private userAccountService = inject(UserAccountService)

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    return this.userAccountService
      .checkUsernameExists(this.userId, control.value)
      .pipe(
        take(1),
        map((isTaken) => (isTaken ? { usernameAlreadyExists: true } : null)),
        catchError(() => of(null))
      );
  }
}
