import { Component, Input, OnInit } from '@angular/core';
import { PlaceholderEntityTemplateEnum } from 'src/app/_enum/placeholder-entity-template.enum';
import { TemplateSizeEnum } from '../placeholder-entities/placeholder-entities.component';

@Component({
  selector: 'app-list-container',
  templateUrl: './list-container.component.html',
  styleUrls: ['./list-container.component.scss'],
})
export class ListContainerComponent implements OnInit {
  @Input() count = 0;
  @Input() templateType: PlaceholderEntityTemplateEnum;
  @Input() templateSize: TemplateSizeEnum = TemplateSizeEnum.LARGE;

  constructor() { }

  ngOnInit() { }
}
