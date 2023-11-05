import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-base-control',
  templateUrl: './base-control.component.html',
  styleUrls: ['./base-control.component.scss'],
})
export class BaseControlComponent implements OnInit {
  constructor() {}

  ngOnInit() {}

  value(value: any = null) {
    console.warn('Implement value() function!');
  }

  validate(): boolean {
    return true;
  }
}
