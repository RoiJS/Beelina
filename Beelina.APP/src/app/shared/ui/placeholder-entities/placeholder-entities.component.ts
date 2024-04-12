import { Component, Input, OnInit } from '@angular/core';
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
  @Input() templateType: PlaceholderEntityTemplateEnum;
  @Input() templateSize: TemplateSizeEnum = TemplateSizeEnum.LARGE;

  constructor() { }

  ngOnInit() { }
}
