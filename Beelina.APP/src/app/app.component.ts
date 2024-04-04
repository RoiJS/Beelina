import { NestedTreeControl } from '@angular/cdk/tree';
import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
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

  private activatedUrl = '';

  isSystemUpdateActive: boolean;
  isOnline: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean = true;

  constructor(
    private authService: AuthService,
    private appVersionService: AppVersionService,
    private router: Router,
    private sideDrawerService: SidedrawerService,
    private storageService: StorageService,
    private translateService: TranslateService,
    private generalInformationService: GeneralInformationService,
    protected override uiService: UIService
  ) {
    super(uiService);
    this.translateService.setDefaultLang('en');
  }

  override ngOnInit(): void {
    this.authService.user.subscribe((user) => {
      this.sideDrawerService.setCurrentUserPrivileges(
        user?.getModulePrivilege(ModuleEnum.Retail)
      );
      this._currentLoggedInUser = user;
      this.isAdmin = this.modulePrivilege(ModuleEnum.Retail) === this.getPermissionLevel(PermissionLevelEnum.Administrator);
      this.menuDataSource.data = this.sideDrawerService.getMenus();
      this.isAuthenticated = (user !== null);

      if (
        this.modulePrivilege(ModuleEnum.Retail) ===
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
      if (this.isAdmin) this.uiService.toggleDrawer();
      this.authService.logout();
    }
  }

  isPageSelected(url: string, fragment: string = ''): boolean {
    let currentUrl = url;
    return this.activatedUrl === currentUrl;
  }

  private updateOnlineStatus(): void {
    this.isOnline = window.navigator.onLine;
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
        this.activatedUrl = event.urlAfterRedirects;
        this.generalInformationService
          .getGeneralInformation()
          .subscribe((info: GeneralInformation) => {
            this.isSystemUpdateActive = info.systemUpdateStatus;
          });
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
