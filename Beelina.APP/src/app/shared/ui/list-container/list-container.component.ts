import { Component, Input, OnInit } from '@angular/core';
import { EmptyEntityTemplateEnum } from 'src/app/_enum/empty-entity-template.enum';

@Component({
  selector: 'app-list-container',
  templateUrl: './list-container.component.html',
  styleUrls: ['./list-container.component.scss'],
})
export class ListContainerComponent implements OnInit {
  @Input() count = 0;
  @Input() templateType: EmptyEntityTemplateEnum;

  constructor() {}

  ngOnInit() {}
}
