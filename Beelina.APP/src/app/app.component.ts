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
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs';

import { SharedComponent } from './shared/components/shared/shared.component';

import { ModuleEnum } from './_enum/module.enum';
import { PermissionLevelEnum } from './_enum/permission-level.enum';
import { AppVersionService } from './_services/app-version.service';
import { AuthService } from './_services/auth.service';
import { GeneralInformationService } from './_services/general-information.service';
import { SidedrawerService } from './_services/sidedrawer.service';
import { StorageService } from './_services/storage.service';
import { UIService } from './_services/ui.service';

import { IMenu } from './_interfaces/imenu';
import { GeneralInformation } from './_models/general-information.model';
import { SwUpdate } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  router = inject(Router);
  sideDrawerService = inject(SidedrawerService);
  storageService = inject(StorageService);
  translateService = inject(TranslateService);
  generalInformationService = inject(GeneralInformationService);
  swUpdate = inject(SwUpdate);
  snackbar = inject(MatSnackBar)

  constructor(
    protected override uiService: UIService
  ) {
    super(uiService);
    this.translateService.setDefaultLang('en');

    if (this.swUpdate.isEnabled) {
      this.swUpdate.checkForUpdate().then((result) => {
        console.log(result)
        if (result) {
          this.promptUser();
        }
      });
    }
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

  private promptUser(): void {
    const snackBarRef = this.snackbar.open('A new version is available', 'Reload', {
      duration: 6000,
    });

    snackBarRef.onAction().subscribe(() => {
      window.location.reload();
    });
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
            // this.currentAppVersion.set(info.appVersion);

            // const newAppVersion = this.appVersionService.appVersionNumber !== this.currentAppVersion();
            // console.log(newAppVersion);

            if (this.isSystemUpdateActive()) {
              this.authService.logout();
            }
          });
      });
  }

  get copyRightText(): string {
    return this.appVersionService.copyRightText;
  }

  get appVersion(): string {
    return this.appVersionService.appVersion;
  }

  // get newAppVersion(): boolean {
  //   return this.appVersionService.appVersion !== this.currentAppVersion();
  // }

  hasChild = (_: number, node: IMenu) =>
    !!node.children && node.children.length > 0;
}
