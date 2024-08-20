import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  settingsModule: ISettingsModules[] = [
    {
      icon: 'assignment',
      label: 'Order Transactions',
      description: 'Manage settings related with Order Transactions',
      url: '/settings/order-transactions'
    },
    {
      icon: 'bar_chart',
      label: 'Reports',
      description: 'Manage report settings',
      url: '/settings/reports'
    },
    {
      icon: 'person_pin',
      label: 'Profile',
      description: 'Manage your profile account',
      url: '/profile'
    },
  ];

  router = inject(Router);

  constructor() { }

  ngOnInit() {
  }

  goToUrl(url: string) {
    console.log(url);
    this.router.navigate([url]);
  }

}

interface ISettingsModules {
  icon: string;
  label: string;
  description: string;
  url: string;
}
