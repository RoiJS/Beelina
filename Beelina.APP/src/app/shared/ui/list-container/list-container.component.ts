import { Component, Input, OnInit } from '@angular/core';
import { EmptyEntityTemplateEnum } from 'src/app/_enum/empty-entity-template.enum';
import { TemplateSizeEnum } from '../empty-entities-placeholder/empty-entities-placeholder.component';

@Component({
  selector: 'app-list-container',
  templateUrl: './list-container.component.html',
  styleUrls: ['./list-container.component.scss'],
})
export class ListContainerComponent implements OnInit {
  @Input() count = 0;
  @Input() templateType: EmptyEntityTemplateEnum;
  @Input() templateSize: TemplateSizeEnum = TemplateSizeEnum.LARGE;

  constructor() { }

  ngOnInit() { }
}
