import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReportsAdminComponent } from './reports-admin.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ReportsAdminComponent,
        outlet: 'adminDashboard'
      }
    ])
  ],
  declarations: [ReportsAdminComponent]
})
export class ReportsAdminModule { }
