import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';

import { Report } from '../_models/report';
import { ReportsService } from '../_services/reports.service';
import { BaseComponent } from '../shared/components/base-component/base.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ReportSettingsComponent } from './report-settings/report-settings.component';
import { LocalClientSubscriptionDbService } from '../_services/local-db/local-client-subscription-db.service';
import { ClientSubscriptionDetails } from '../_models/client-subscription-details.model';
import { ReportGroup } from '../_interfaces/report-group.interface';
import { getReportCategoryNumeric, ReportCategoryEnum } from '../_enum/report-category.enum';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        height: '*',
        opacity: 1,
        overflow: 'visible'
      })),
      state('out', style({
        height: '0px',
        opacity: 0,
        overflow: 'hidden'
      })),
      transition('in => out', animate('300ms ease-in')),
      transition('out => in', animate('300ms ease-out'))
    ])
  ]
})
export class ReportsComponent extends BaseComponent implements OnInit {
  private _reports: Array<Report>;
  private _reportGroups: Array<ReportGroup>;

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
        this._reportGroups = this.groupReportsByCategory(reports);
        this._isLoading = false;
      },

      error: () => {
        this._isLoading = false;
      }
    });
  }

  private groupReportsByCategory(reports: Array<Report>): Array<ReportGroup> {
    const groupedReports: { [key: number]: ReportGroup } = {};

    reports.forEach(report => {
      const category = report.category;

      if (!groupedReports[category]) {
        groupedReports[category] = {
          category: category,
          categoryLabelKey: this.getCategoryLabelKey(category),
          reports: [],
          isCollapsed: false // Start with all sections expanded
        };
      }

      groupedReports[category].reports.push(report);
    });

    // Convert to array and sort by category
    return Object.values(groupedReports).sort((a, b) => getReportCategoryNumeric(a.category) - getReportCategoryNumeric(b.category));
  }

  private getCategoryLabelKey(category: ReportCategoryEnum): string {
    switch (category) {
      case ReportCategoryEnum.OrderTransactions:
        return 'REPORTS_PAGE.CATEGORIES.ORDER_TRANSACTIONS';
      case ReportCategoryEnum.Products:
        return 'REPORTS_PAGE.CATEGORIES.PRODUCTS';
      case ReportCategoryEnum.Sales:
        return 'REPORTS_PAGE.CATEGORIES.SALES';
      default:
        return 'REPORTS_PAGE.CATEGORIES.OTHER';
    }
  }

  toggleCategoryCollapse(group: ReportGroup) {
    group.isCollapsed = !group.isCollapsed;
  }

  onKeyboardToggle(event: Event, group: ReportGroup) {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
      event.preventDefault();
      this.toggleCategoryCollapse(group);
    }
  }

  openReportSettings() {
    this.bottomSheet.open(ReportSettingsComponent);
  }

  goToReportInformation(reportId: number) {
    this.router.navigate(['/app/reports', reportId]);
  }

  get reports(): Array<Report> {
    return this._reports;
  }

  get reportGroups(): Array<ReportGroup> {
    return this._reportGroups;
  }
}
