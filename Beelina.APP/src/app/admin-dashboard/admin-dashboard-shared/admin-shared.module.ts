import { NgModule } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';

import { AdminNavbarComponent } from './admin-navbar/admin-navbar.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule
  ],
  exports: [AdminNavbarComponent],
  declarations: [AdminNavbarComponent]
})
export class AdminSharedModule { }
