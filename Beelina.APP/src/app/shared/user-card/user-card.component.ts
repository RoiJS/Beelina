import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ModuleEnum } from 'src/app/_enum/module.enum';

import { User } from 'src/app/_models/user.model';
import { AuthService } from 'src/app/_services/auth.service';
import { UIService } from 'src/app/_services/ui.service';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.scss'],
})
export class UserCardComponent implements OnInit {
  private _user: User;
  constructor(
    private authService: AuthService,
    private router: Router,
    private translateSerice: TranslateService,
    private uiService: UIService
  ) {
    this.authService.user.subscribe((user: User) => {
      this._user = user;
    });
  }

  ngOnInit() {}

  goToProfile() {
    this.router.navigate(['/profile']);
    this.uiService.toggleDrawer();
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
}
