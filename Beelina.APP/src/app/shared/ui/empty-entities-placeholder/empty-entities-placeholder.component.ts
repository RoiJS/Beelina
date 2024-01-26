import { Component, Input, OnInit } from '@angular/core';
import { EmptyEntityTemplateEnum } from 'src/app/_enum/empty-entity-template.enum';

export enum TemplateSizeEnum {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
};

@Component({
  selector: 'app-empty-entities-placeholder',
  templateUrl: './empty-entities-placeholder.component.html',
  styleUrls: ['./empty-entities-placeholder.component.scss'],
})
export class EmptyEntitiesPlaceholderComponent implements OnInit {
  @Input() templateType: EmptyEntityTemplateEnum;
  @Input() templateSize: TemplateSizeEnum = TemplateSizeEnum.LARGE;

  constructor() { }

  ngOnInit() { }
}
