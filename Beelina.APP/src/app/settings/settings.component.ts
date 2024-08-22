import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  translateService = inject(TranslateService);

  settingsModule: ISettingsModules[] = [
    {
      icon: 'assignment',
      label: this.translateService.instant('SETTINGS_PAGE.MODULE_LIST.ORDER_TRANSACTION.LABEL'),
      description: this.translateService.instant('SETTINGS_PAGE.MODULE_LIST.ORDER_TRANSACTION.DESCRIPTION'),
      url: '/settings/order-transactions'
    },
    {
      icon: 'bar_chart',
      label: this.translateService.instant('SETTINGS_PAGE.MODULE_LIST.REPORTS.LABEL'),
      description: this.translateService.instant('SETTINGS_PAGE.MODULE_LIST.REPORTS.DESCRIPTION'),
      url: '/settings/reports'
    },
    {
      icon: 'person_pin',
      label: this.translateService.instant('SETTINGS_PAGE.MODULE_LIST.PROFILE.LABEL'),
      description: this.translateService.instant('SETTINGS_PAGE.MODULE_LIST.PROFILE.DESCRIPTION'),
      url: '/profile'
    },
  ];

  router = inject(Router);

  constructor() { }

  ngOnInit() {
  }

  goToUrl(url: string) {
    this.router.navigate([url]);
  }
}

interface ISettingsModules {
  icon: string;
  label: string;
  description: string;
  url: string;
}
