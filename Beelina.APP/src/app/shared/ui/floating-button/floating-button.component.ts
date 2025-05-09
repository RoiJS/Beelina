import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-floating-button',
  templateUrl: './floating-button.component.html',
  styleUrls: ['./floating-button.component.scss']
})
export class FloatingButtonComponent {
  icon = input<string>('');
  bottom = input<number>(90);
  tapButton = output<number>();

  onTapButton() {
    this.tapButton.emit(0);
  }
}
