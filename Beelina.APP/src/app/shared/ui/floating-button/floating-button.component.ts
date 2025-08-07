import { Component, inject, input, output } from '@angular/core';
import { TooltipPosition } from '@angular/material/tooltip';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-floating-button',
  templateUrl: './floating-button.component.html',
  styleUrls: ['./floating-button.component.scss']
})
export class FloatingButtonComponent {
  icon = input<string>('');
  bottom = input<number>(90);
  tapButton = output<number>();
  tooltip = input<string>('');
  tooltipPosition = input<TooltipPosition>('left');

  private translateService = inject(TranslateService);

  onTapButton() {
    this.tapButton.emit(0);
  }

  get tooltipText(): string {
    if (!this.tooltip()) {
      return '';
    }
    console.log(this.translateService.instant(this.tooltip()));
    return this.translateService.instant(this.tooltip());
  }
}
