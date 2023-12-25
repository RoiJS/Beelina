import {
  ComponentFactoryResolver,
  ComponentRef,
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Injector,
  Input,
  OnDestroy,
  Output,
  ViewContainerRef
} from '@angular/core';
import getCaretCoordinates from 'textarea-caret';
import { takeUntil } from 'rxjs/operators';
import { TextInputAutocompleteMenuComponent } from '../shared/text-input-autocomplete/text-input-autocomplete-menu.component';
import { Subject } from 'rxjs';
import toPX from 'to-px';

export interface ChoiceSelectedEvent {
  choice: any;
  insertedAt: {
    start: number;
    end: number;
  };
}

@Directive({
  selector:
    'textarea[textInputAutocomplete],input[type="text"][textInputAutocomplete]'
})
export class TextInputAutocompleteDirective implements OnDestroy {
  /**
   * The character that will trigger the menu to appear
   */
  @Input() triggerCharacter = '@';

  /**
   * An optional keyboard shortcut that will trigger the menu to appear
   */
  @Input() keyboardShortcut: (event: KeyboardEvent) => boolean;

  /**
   * The regular expression that will match the search text after the trigger character
   */
  @Input() searchRegexp = /^[\w\s]*$/;

  /**
   * Whether to close the menu when the host textarea loses focus
   */
  @Input() closeMenuOnBlur = false;

  /**
   * The menu component to show with available options.
   * You can extend the built in `TextInputAutocompleteMenuComponent` component to use a custom template
   */
  @Input() menuComponent = TextInputAutocompleteMenuComponent;

  /**
   * Called when the options menu is shown
   */
  @Output() menuShown = new EventEmitter();

  /**
   * Called when the options menu is hidden
   */
  @Output() menuHidden = new EventEmitter();

  /**
   * Called when a choice is selected
   */
  @Output() choiceSelected = new EventEmitter<ChoiceSelectedEvent>();

  /**
   * A function that accepts a search string and returns an array of choices. Can also return a promise.
   */
  @Input() findChoices: (searchText: string, choices: any[]) => any[] | Promise<any[]>;

  @Input() choices: any[] = [];

  /**
   * A function that formats the selected choice once selected.
   */
  @Input() getChoiceLabel: (choice: any) => string = choice => choice;

  /* tslint:disable member-ordering */
  private menu:
    | {
      component: ComponentRef<TextInputAutocompleteMenuComponent>;
      triggerCharacterPosition: number;
      lastCaretPosition?: number;
    }
    | undefined;

  private menuHidden$ = new Subject();

  private usingShortcut = false;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private viewContainerRef: ViewContainerRef,
    private injector: Injector,
    private elm: ElementRef
  ) { }

  onKeyDown(key: string) {
    console.log('onKeyDown', key);
    if (key === this.triggerCharacter) {
      this.usingShortcut = false;
      this.showMenu();
    }
  }

  @HostListener('input', ['$event.target.value'])
  onChange(value: string) {
    this.onKeyDown(value[value.length - 1]);
    console.log('onChange', value);
    if (this.menu) {
      console.log('triggerCharacterPosition', this.menu.triggerCharacterPosition);
      const cursor = this.elm.nativeElement.selectionStart;
      if (cursor < this.menu.triggerCharacterPosition) {
        this.hideMenu();
      } else {
        if (this.usingShortcut && !this.menu) {
          value = this.triggerCharacter;
        }
        const offset = this.usingShortcut ? 0 : 1;
        const searchText = value.slice(
          this.menu.triggerCharacterPosition + offset,
          cursor
        );

        if (!searchText.match(this.searchRegexp)) {
          this.hideMenu();
        } else {
          this.menu.component.instance.searchText = searchText;
          this.menu.component.instance.choices = [];
          this.menu.component.instance.choiceLoadError = undefined;
          this.menu.component.instance.choiceLoading = true;
          this.menu.component.changeDetectorRef.detectChanges();
          Promise.resolve(this.findChoices(searchText, this.choices))
            .then(choices => {
              if (this.menu) {
                this.menu.component.instance.choices = choices;
                this.menu.component.instance.choiceLoading = false;
                this.menu.component.changeDetectorRef.detectChanges();
              }
            })
            .catch(err => {
              if (this.menu) {
                this.menu.component.instance.choiceLoading = false;
                this.menu.component.instance.choiceLoadError = err;
                this.menu.component.changeDetectorRef.detectChanges();
              }
            });
        }
      }
    }
  }

  @HostListener('blur')
  onBlur() {
    if (this.menu) {
      this.menu.lastCaretPosition = this.elm.nativeElement.selectionStart;

      if (this.closeMenuOnBlur === true) {
        this.hideMenu();
      }
    }
  }

  private showMenu() {
    if (!this.menu) {
      const menuFactory = this.componentFactoryResolver.resolveComponentFactory<
        TextInputAutocompleteMenuComponent
      >(this.menuComponent);
      this.menu = {
        component: this.viewContainerRef.createComponent(
          menuFactory,
          0,
          this.injector
        ),
        triggerCharacterPosition: (this.elm.nativeElement.selectionStart - 1)
      };

      const lineHeight = this.getLineHeight(this.elm.nativeElement);
      const { top, left } = getCaretCoordinates(
        this.elm.nativeElement,
        this.elm.nativeElement.selectionStart
      );
      this.menu.component.instance.position = {
        top: top + lineHeight,
        left
      };
      this.menu.component.changeDetectorRef.detectChanges();
      this.menu.component.instance.selectChoice
        .pipe(takeUntil(this.menuHidden$))
        .subscribe(choice => {
          const label = this.getChoiceLabel(choice);
          const textarea: HTMLTextAreaElement = this.elm.nativeElement;
          const value: string = textarea.value;
          const startIndex = this.menu!.triggerCharacterPosition;
          const start = value.slice(0, startIndex);
          const caretPosition =
            this.menu!.lastCaretPosition || textarea.selectionStart;
          const end = value.slice(caretPosition);
          textarea.value = start + label + end;
          // force ng model / form control to update
          textarea.dispatchEvent(new Event('input'));
          this.hideMenu();
          const setCursorAt = (start + label).length;
          textarea.setSelectionRange(setCursorAt, setCursorAt);
          textarea.focus();
          this.choiceSelected.emit({
            choice,
            insertedAt: {
              start: startIndex,
              end: startIndex + label.length
            }
          });
        });
      this.menuShown.emit();
    }
  }

  getLineHeight(elm: HTMLElement): number {
    const lineHeightStr = getComputedStyle(elm).lineHeight || '';
    const fontSizeStr = getComputedStyle(elm).fontSize || '';
    const fontSize = +toPX(fontSizeStr);
    const normal = 1.2;
    const lineHeightNum = parseFloat(lineHeightStr);

    if (lineHeightStr === lineHeightNum + '') {
      return fontSize * lineHeightNum;
    }

    if (lineHeightStr.toLowerCase() === 'normal') {
      return fontSize * normal;
    }

    return toPX(lineHeightStr);
  }

  private hideMenu() {
    if (this.menu) {
      this.menu.component.destroy();
      this.menuHidden$.next('');
      this.menuHidden.emit();
      this.menu = undefined;
    }
  }

  ngOnDestroy() {
    this.hideMenu();
  }
}
