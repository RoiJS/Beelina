import { Component, input } from '@angular/core';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss']
})
export class BannerComponent {

  type = input<BannerTypeEnum>(BannerTypeEnum.INFO);

  get icon(): string {
    switch (this.type()) {
      case BannerTypeEnum.INFO:
        return 'error_outline';
      case BannerTypeEnum.SUCCESS:
        return 'check_circle_outline';
      case BannerTypeEnum.WARNING:
        return 'warning';
      case BannerTypeEnum.ERROR:
        return 'highlight_off';
    }
  }
}

export enum BannerTypeEnum {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error'
}
