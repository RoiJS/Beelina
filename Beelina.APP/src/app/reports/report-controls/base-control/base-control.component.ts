import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-base-control',
  templateUrl: './base-control.component.html',
  styleUrls: ['./base-control.component.scss'],
})
export class BaseControlComponent implements OnInit {
  protected controlLabelIdentifier: string;

  constructor(protected translateService: TranslateService) {}

  ngOnInit() {}

  value(value: any = null) {
    console.warn('Implement value() function!');
  }

  validate(): boolean {
    return true;
  }

  setControlLabelIdentifier(controlLabelIdentifier: string) {
    this.controlLabelIdentifier = controlLabelIdentifier;
  }

  get controLabel(): string {
    return this.translateService.instant(this.controlLabelIdentifier);
  }
}
