import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-floating-button',
  templateUrl: './floating-button.component.html',
  styleUrls: ['./floating-button.component.scss']
})
export class FloatingButtonComponent implements OnInit {
  @Input() icon: string;
  @Output() tapButton = new EventEmitter();

  constructor() {}

  ngOnInit() {}

  onTapButton() {
    this.tapButton.emit(0);
  }
}
