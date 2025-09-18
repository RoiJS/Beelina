import { Component, inject, input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { BannerTypeEnum } from '../banner/banner.component';

@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss']
})
export class BadgeComponent {
  type = input<BannerTypeEnum>(BannerTypeEnum.INFO);
  textIdentifier = input<string>('');
  label = input<string>('');
  size = input<'small' | 'medium' | 'large'>('medium');
  variant = input<'filled' | 'outlined' | 'flat'>('filled');

  private translateService = inject(TranslateService);

  get text(): string {
    return this.textIdentifier().length > 0 ? this.translateService.instant(this.textIdentifier()) : this.label();
  }
}
