import { Component } from '@angular/core';

@Component({
  selector: 'text-input-autocomplete-container',
  styles: [
    `
      :host {
        position: relative;
        display: block;
      }
    `
  ],
  template: '<ng-content></ng-content>'
})
export class TextInputAutocompleteContainerComponent { }
