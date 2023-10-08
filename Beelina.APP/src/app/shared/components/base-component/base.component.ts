import { Component } from '@angular/core';

import { EmptyEntityTemplateEnum } from 'src/app/_enum/empty-entity-template.enum';

@Component({
  selector: 'app-base-component',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss'],
})
export class BaseComponent {
  protected _isLoading = false;
  protected _emptyTemplateType = EmptyEntityTemplateEnum;

  constructor() {}

  get isLoading(): boolean {
    return this._isLoading;
  }

  get emptyEntityTemplateEnum(): typeof EmptyEntityTemplateEnum {
    return this._emptyTemplateType;
  }
}
