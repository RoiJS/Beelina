import {
  Directive,
  Input,
  Output,
  EventEmitter,
  HostBinding,
  HostListener
} from '@angular/core';

@Directive({ selector: '[appLongPress]' })
export class LongPressDirective {

  @Output() longPress = new EventEmitter();
  private pressing: boolean = false;
  private longPressing: boolean = false;
  private timeout: any;

  @HostListener('mousedown', ['$event'])
  @HostListener('touchstart', ['$event'])
  onPress(event: Event) {
    this.pressing = true;
    this.longPressing = false;
    this.timeout = setTimeout(() => {
      if (this.pressing) {
        this.longPressing = true;
        this.longPress.emit(event);
      }
    }, 500); // 500ms for long press
  }

  @HostListener('mouseup')
  @HostListener('touchend')
  @HostListener('mouseleave')
  onRelease() {
    this.pressing = false;
    clearTimeout(this.timeout);
  }
}
