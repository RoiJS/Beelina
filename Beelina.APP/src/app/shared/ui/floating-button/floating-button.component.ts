import { Component, input, output } from '@angular/core';
import { TooltipPosition } from '@angular/material/tooltip';

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

  onTapButton() {
    this.tapButton.emit(0);
  }
}
