import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ModuleEnum } from 'src/app/_enum/module.enum';

import { User } from 'src/app/_models/user.model';
import { AuthService } from 'src/app/_services/auth.service';
import { StorageService } from 'src/app/_services/storage.service';
import { UIService } from 'src/app/_services/ui.service';
import { SharedComponent } from '../components/shared/shared.component';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.scss'],
})
export class UserCardComponent extends SharedComponent implements OnInit {
  private _user: User;
  private _company: string;

  constructor(
    private authService: AuthService,
    private router: Router,
    private translateSerice: TranslateService,
    private storageService: StorageService,
    override uiService: UIService
  ) {
    super(uiService);
    this.authService.user.subscribe((user: User) => {
      this._user = user;
    });

    this._company = this.storageService.getString('company');
  }

  override ngOnInit() { }

  goToProfile() {
    this.router.navigate(['/profile']);
    if (this.isHandset) {
      this.uiService.toggleDrawer();
    }
  }

  get getUserType(): string {
    switch (this._user?.getModulePrivilege(ModuleEnum.Retail)) {
      case 1:
        return this.translateSerice.instant('USER_TYPE.SALES_AGENT');
      case 2:
        return this.translateSerice.instant('USER_TYPE.MANAGER');
      case 3:
        return this.translateSerice.instant('USER_TYPE.ADMINISTRATOR');
      default:
        return '';
    }
  }

  get user(): User {
    return this._user;
  }

  get company(): string {
    return this._company;
  }
}
