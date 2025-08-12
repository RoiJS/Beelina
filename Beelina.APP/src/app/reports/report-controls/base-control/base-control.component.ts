import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-base-control',
  templateUrl: './base-control.component.html',
  styleUrls: ['./base-control.component.scss'],
})
export class BaseControlComponent implements OnInit {
  protected controlLabelIdentifier: string;
  protected hide: boolean;
  protected allowAllOption: boolean;
  protected agentTypeOptions: string;
  protected otherControls: Array<any> = [];// Array of other report controls that this control may interact.
  constructor(protected translateService: TranslateService) { }

  ngOnInit() { }

  value(value: any = null) {
    console.warn('Implement value() function!');
  }

  validate(): boolean {
    return true;
  }

  setControlLabelIdentifier(controlLabelIdentifier: string) {
    this.controlLabelIdentifier = controlLabelIdentifier;
  }

  setControlVisibility(show: boolean) {
    this.hide = !show;
  }

  setAgentTypeOptions(agentTypeOptions: string) {
    this.agentTypeOptions = agentTypeOptions;
  }

  setAllowAllOption(activateAllOption: boolean) {
    this.allowAllOption = activateAllOption;
  }

  setOtherControls(controls: Array<any>) {
    this.otherControls = controls;
  }

  get controLabel(): string {
    return this.translateService.instant(this.controlLabelIdentifier);
  }
}
