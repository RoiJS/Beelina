import { Component, EventEmitter, Input, Output } from '@angular/core';

import { BannerTypeEnum } from '../../ui/banner/banner.component';

@Component({
  selector: 'app-filter-card',
  templateUrl: './filter-card.component.html',
  styleUrls: ['./filter-card.component.scss']
})
export class FilterCardComponent {
  @Input() isActive: boolean = false;
  @Input() customizeLabel: string = 'GENERAL_TEXTS.CUSTOMIZE';
  @Input() resetLabel: string = 'GENERAL_TEXTS.RESET';
  @Input() filterLabel: string = 'GENERAL_TEXTS.FILTER';
  @Input() activeLabel: string = 'GENERAL_TEXTS.ACTIVE';

  @Output() filterAction = new EventEmitter<void>();

  bannerTypeEnum = BannerTypeEnum;

  onFilterClick(): void {
    this.filterAction.emit();
  }
}
