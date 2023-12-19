import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppVersionService {
  private _appVersion = new BehaviorSubject<string>('1.10');

  constructor(private translate: TranslateService) {}

  get copyRightText(): string {
    return `${this.translate.instant(
      'SIDE_DRAWER_SECTION.FOOTER.COPYRIGHT'
    )} ${this.translate.instant(
      'SIDE_DRAWER_SECTION.FOOTER.ALL_RIGHTS_RESERVED'
    )}`;
  }

  get appVersion(): string {
    return `${this.translate.instant('SIDE_DRAWER_SECTION.FOOTER.VERSION')} ${
      this._appVersion.value
    }`;
  }
}
