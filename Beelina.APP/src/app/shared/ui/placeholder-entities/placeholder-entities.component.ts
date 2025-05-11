import { Component, input, OnInit } from '@angular/core';

import { PlaceholderEntityTemplateEnum } from 'src/app/_enum/placeholder-entity-template.enum';

export enum TemplateSizeEnum {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
};

@Component({
  selector: 'app-placeholder-entities',
  templateUrl: './placeholder-entities.component.html',
  styleUrls: ['./placeholder-entities.component.scss'],
})
export class PlaceholderEntitiesComponent implements OnInit {
  templateType = input<PlaceholderEntityTemplateEnum>(null);
  templateSize = input<TemplateSizeEnum>(TemplateSizeEnum.LARGE);

  constructor() { }

  ngOnInit() { }
}
