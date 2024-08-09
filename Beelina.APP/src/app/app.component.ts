import { NestedTreeControl } from '@angular/cdk/tree';
import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NavigationEnd, Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs';

import { SharedComponent } from './shared/components/shared/shared.component';

import { ModuleEnum } from './_enum/module.enum';
import { PermissionLevelEnum } from './_enum/permission-level.enum';
import { AppVersionService } from './_services/app-version.service';
import { AuthService } from './_services/auth.service';
import { DialogService } from './shared/ui/dialog/dialog.service';
import { GeneralInformationService } from './_services/general-information.service';
import { SidedrawerService } from './_services/sidedrawer.service';
import { StorageService } from './_services/storage.service';
import { UIService } from './_services/ui.service';
import { UserAccountService } from './_services/user-account.service';

import { IMenu } from './_interfaces/imenu';
import { GeneralInformation } from './_models/general-information.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent
  extends SharedComponent
  implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatSidenav) sideNav: MatSidenav | undefined;

  treeControl = new NestedTreeControl<IMenu>((node) => node.children);
  menuDataSource = new MatTreeNestedDataSource<IMenu>();

  activatedUrl = signal('');
  currentAppVersion = signal<string>('');
  isSystemUpdateActive = signal<boolean>(false);
  isOnline = signal<boolean>(true);
  isAuthenticated = signal<boolean>(false);
  isAdmin = signal<boolean>(true);

  authService = inject(AuthService);
  appVersionService = inject(AppVersionService);
  dialogService = inject(DialogService);
  generalInformationService = inject(GeneralInformationService);
  router = inject(Router);
  sideDrawerService = inject(SidedrawerService);
  storageService = inject(StorageService);
  swUpdate = inject(SwUpdate);
  translateService = inject(TranslateService);
  userAccountService = inject(UserAccountService);

  constructor(
    protected override uiService: UIService
  ) {
    super(uiService);
    this.translateService.setDefaultLang('en');
  }

  override ngOnInit(): void {
    this.authService.user.subscribe((user) => {
      this.sideDrawerService.setCurrentUserPrivileges(
        user?.getModulePrivilege(ModuleEnum.Distribution).value
      );
      this._currentLoggedInUser = user;
      this.isAdmin.set(this.modulePrivilege(ModuleEnum.Distribution) === this.getPermissionLevel(PermissionLevelEnum.Administrator));
      this.menuDataSource.data = this.sideDrawerService.getMenus();
      this.isAuthenticated.set((user !== null));

      if (user) {
        this.userAccountService.getUserSetting(user.id).subscribe();
      }

      if (
        this.modulePrivilege(ModuleEnum.Distribution) ===
        this.getPermissionLevel(PermissionLevelEnum.User)
      ) {
        this.storageService.storeString(
          'currentSalesAgentId',
          this._currentLoggedInUser.id.toString()
        );
      }
    });

    this.initRouterEvents();
    this.updateOnlineStatus();
    this.monitorConnectionStatus();
    this.checkNewAppVersion();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  ngAfterViewInit(): void {
    this.uiService.setDrawerRef(this.sideNav);
  }

  onNavItemTap(name: string, url: string, fragment: string, isExternalUrl: boolean): void {
    if (isExternalUrl) {
      window.open(url, '_blank');
    } else {
      this.router.navigate([url], { fragment });
    }

    if (this.isHandset) {
      this.uiService.toggleDrawer();
    }

    if (name === 'MAIN_MENU.LOGOUT') {
      if (this.isAdmin()) this.uiService.toggleDrawer();
      this.authService.logout();
    }
  }

  isPageSelected(url: string, fragment: string = ''): boolean {
    let currentUrl = url;
    return this.activatedUrl() === currentUrl;
  }

  private updateOnlineStatus(): void {
    this.isOnline.set(window.navigator.onLine);
    console.info(`isOnline=[${this.isOnline}]`);
  }

  private monitorConnectionStatus(): void {
    window.addEventListener('online', this.updateOnlineStatus.bind(this));
    window.addEventListener('offline', this.updateOnlineStatus.bind(this));
  }

  private initRouterEvents(): void {
    this.router.events
      .pipe(filter((event: any) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.activatedUrl.set(event.urlAfterRedirects);
        this.generalInformationService
          .getGeneralInformation()
          .subscribe((info: GeneralInformation) => {
            this.isSystemUpdateActive.set(info.systemUpdateStatus);
            if (this.isSystemUpdateActive()) {
              this.authService.logout();
            }
          });
      });
  }

  private checkNewAppVersion() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.checkForUpdate().then((result) => {
        if (result) {
          this.promptUser();
        }
      });
    }
  }

  private promptUser(): void {
    this.dialogService.openAlert(
      this.translateService.instant('MAIN_PAGE.NEW_APP_VERSION_DIALOG.TITLE'),
      this.translateService.instant('MAIN_PAGE.NEW_APP_VERSION_DIALOG.DESCRIPTION').replace("{0}", this.appVersionService.appVersionNumber))
      .subscribe(() => {
        window.location.reload();
      });
  }

  get copyRightText(): string {
    return this.appVersionService.copyRightText;
  }

  get appVersion(): string {
    return this.appVersionService.appVersion;
  }

  hasChild = (_: number, node: IMenu) =>
    !!node.children && node.children.length > 0;
}
