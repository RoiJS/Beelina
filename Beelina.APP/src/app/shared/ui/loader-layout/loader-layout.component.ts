import { Component, inject, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-loader-layout',
  templateUrl: './loader-layout.component.html',
  styleUrls: ['./loader-layout.component.scss']
})
export class LoaderLayoutComponent {
  private translateService = inject(TranslateService);

  @Input() busy = false;
  @Input() label: string;

  constructor() {
    this.label = this.translateService.instant('LOADER_LAYOUT.LOADING_TEXT');
  }
}
