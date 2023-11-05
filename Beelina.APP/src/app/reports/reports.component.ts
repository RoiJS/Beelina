import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Report } from '../_models/report';
import { ReportsService } from '../_services/reports.service';
import { BaseComponent } from '../shared/components/base-component/base.component';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent extends BaseComponent implements OnInit {
  private _reports: Array<Report>;

  constructor(private reportService: ReportsService, private router: Router) {
    super();
  }

  ngOnInit() {
    this._isLoading = true;
    setTimeout(() => {
      this.reportService.getAllReports().subscribe((reports: Array<Report>) => {
        this._reports = reports;
        this._isLoading = false;
      });
    }, 1200);
  }

  goToReportInformation(reportId: number) {
    this.router.navigate(['/reports', reportId]);
  }

  get reports(): Array<Report> {
    return this._reports;
  }
}
