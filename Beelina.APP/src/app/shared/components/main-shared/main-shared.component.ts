import { Component } from '@angular/core';

import { EmptyEntityTemplateEnum } from 'src/app/_enum/empty-entity-template.enum';

@Component({
  selector: 'app-main-shared',
  templateUrl: './main-shared.component.html',
  styleUrls: ['./main-shared.component.css'],
})
export class MainSharedComponent {
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
