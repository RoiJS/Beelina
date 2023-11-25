import { NestedTreeControl } from '@angular/cdk/tree';
import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Platform } from '@angular/cdk/platform';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs';

import { SharedComponent } from './shared/components/shared/shared.component';

import { IMenu } from './_interfaces/imenu';
import { AppVersionService } from './_services/app-version.service';

import { AuthService } from './_services/auth.service';
import { SidedrawerService } from './_services/sidedrawer.service';
import { UIService } from './_services/ui.service';
import { ModuleEnum } from './_enum/module.enum';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent
  extends SharedComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild(MatSidenav) sideNav: MatSidenav | undefined;

  treeControl = new NestedTreeControl<IMenu>((node) => node.children);
  menuDataSource = new MatTreeNestedDataSource<IMenu>();

  private activatedUrl = '';

  isOnline: boolean;
  modalVersion: boolean;
  modalPwaEvent: any;
  modalPwaPlatform: string | undefined;

  constructor(
    private authService: AuthService,
    private appVersionService: AppVersionService,
    private router: Router,
    private sideDrawerService: SidedrawerService,
    private translateService: TranslateService,
    private swUpdate: SwUpdate,
    private platform: Platform,
    protected override uiService: UIService
  ) {
    super(uiService);
    this.translateService.setDefaultLang('en');

    this.modalVersion = false;
  }

  override ngOnInit(): void {
    this.authService.user.subscribe((user) => {
      this.sideDrawerService.setCurrentUserPrivileges(
        user?.getModulePrivilege(ModuleEnum.Retail)
      );
      this.menuDataSource.data = this.sideDrawerService.getMenus();
    });

    this.initRouterEvents();

    this.updateOnlineStatus();

    window.addEventListener('online', this.updateOnlineStatus.bind(this));
    window.addEventListener('offline', this.updateOnlineStatus.bind(this));

    // if (this.swUpdate.isEnabled) {
    //   console.log('Service Worker is enabled');
    //   this.swUpdate.versionUpdates.pipe(
    //     filter(
    //       (evt: any): evt is VersionReadyEvent => evt.type === 'VERSION_READY'
    //     ),
    //     map((evt: any) => {
    //       console.info(
    //         `currentVersion=[${evt.currentVersion} | latestVersion=[${evt.latestVersion}]`
    //       );
    //       this.modalVersion = true;
    //     })
    //   );
    // } else {
    //   console.log('Service Worker is disabled');
    // }
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  ngAfterViewInit(): void {
    this.uiService.setDrawerRef(this.sideNav);
  }

  onNavItemTap(name: string, url: string, fragment: string): void {
    this.router.navigate([url], { fragment });

    if (this.isHandset) {
      this.uiService.toggleDrawer();
    }

    if (name === 'MAIN_MENU.LOGOUT') {
      this.authService.logout();
    }
  }

  isPageSelected(url: string, fragment: string = ''): boolean {
    let currentUrl = url;

    // if (fragment) {
    //   currentUrl = `${url}#${fragment}`;
    // }
    return this.activatedUrl === currentUrl;
  }

  public updateVersion(): void {
    this.modalVersion = false;
    window.location.reload();
  }

  public closeVersion(): void {
    this.modalVersion = false;
  }

  private updateOnlineStatus(): void {
    this.isOnline = window.navigator.onLine;
    console.info(`isOnline=[${this.isOnline}]`);
  }

  private loadModalPwa(): void {
    if (this.platform.ANDROID) {
      window.addEventListener('beforeinstallprompt', (event: any) => {
        event.preventDefault();
        this.modalPwaEvent = event;
        this.modalPwaPlatform = 'ANDROID';
      });
    }

    if (this.platform.IOS && this.platform.SAFARI) {
      const isInStandaloneMode =
        'standalone' in window.navigator &&
        (<any>window.navigator)['standalone'];
      if (!isInStandaloneMode) {
        this.modalPwaPlatform = 'IOS';
      }
    }
  }

  public addToHomeScreen(): void {
    this.modalPwaEvent.prompt();
    this.modalPwaPlatform = undefined;
  }

  public closePwa(): void {
    this.modalPwaPlatform = undefined;
  }

  private initRouterEvents(): void {
    this.router.events
      .pipe(filter((event: any) => event instanceof NavigationEnd))
      .subscribe(
        (event: NavigationEnd) => (this.activatedUrl = event.urlAfterRedirects)
      );
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
