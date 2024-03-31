import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { BannerTypeEnum } from '../banner/banner.component';

@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss']
})
export class BadgeComponent implements OnInit {
  @Input() type: BannerTypeEnum;
  @Input() textIdentifier: string = '';

  constructor(private translateService: TranslateService) { }

  ngOnInit() {
  }

  get text(): string {
    return this.translateService.instant(this.textIdentifier);
  }
}
