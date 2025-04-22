import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Report } from '../_models/report';
import { ReportsService } from '../_services/reports.service';
import { BaseComponent } from '../shared/components/base-component/base.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ReportSettingsComponent } from './report-settings/report-settings.component';
import { LocalClientSubscriptionDbService } from '../_services/local-db/local-client-subscription-db.service';
import { ClientSubscriptionDetails } from '../_models/client-subscription-details.model';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent extends BaseComponent implements OnInit {
  private _reports: Array<Report>;

  clientSubscriptionDetails: ClientSubscriptionDetails;

  bottomSheet = inject(MatBottomSheet);
  reportService = inject(ReportsService);
  router = inject(Router);
  localClientSubscriptionDbService = inject(LocalClientSubscriptionDbService);

  constructor() {
    super();
  }

  ngOnInit() {
    this._isLoading = true;
    this.reportService.getAllReports().subscribe({
      next: async (reports: Array<Report>) => {
        this.clientSubscriptionDetails = await this.localClientSubscriptionDbService.getLocalClientSubsription();

        // Filter reports based on subscription type
        if (this.clientSubscriptionDetails.subscriptionFeatureAvailableReports.length > 0) {
          reports = reports.filter(r => this.clientSubscriptionDetails.subscriptionFeatureAvailableReports.some(sr => sr.reportId === r.id));
        }

        this._reports = reports;
        this._isLoading = false;
      },

      error: () => {
        this._isLoading = false;
      }
    });
  }

  openReportSettings() {
    this.bottomSheet.open(ReportSettingsComponent);
  }

  goToReportInformation(reportId: number) {
    this.router.navigate(['/reports', reportId]);
  }

  get reports(): Array<Report> {
    return this._reports;
  }
}
