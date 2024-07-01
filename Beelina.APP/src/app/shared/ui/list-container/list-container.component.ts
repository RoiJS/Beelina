import { Component, OnInit, computed, inject, input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { PlaceholderEntityTemplateEnum } from 'src/app/_enum/placeholder-entity-template.enum';
import { TemplateSizeEnum } from '../placeholder-entities/placeholder-entities.component';
import { BannerTypeEnum } from '../banner/banner.component';

@Component({
  selector: 'app-list-container',
  templateUrl: './list-container.component.html',
  styleUrls: ['./list-container.component.scss'],
})
export class ListContainerComponent implements OnInit {
  count = input<number>(0);
  templateType = input<PlaceholderEntityTemplateEnum>(null);
  templateSize = input<TemplateSizeEnum>(TemplateSizeEnum.LARGE);
  labelInformationTextIdentifier = input<string>('');

  labelInfo = computed(() => {
    return !this.labelInformationTextIdentifier() ? '' : this.translateService.instant(this.labelInformationTextIdentifier());
  });

  bannerType = BannerTypeEnum;

  translateService = inject(TranslateService);

  constructor() { }

  ngOnInit() { }

}
