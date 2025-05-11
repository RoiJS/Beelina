import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class RoutingService {
  private router = inject(Router);

  replace(commands: any[]) {
    this.router.navigate(commands);
  }
}
