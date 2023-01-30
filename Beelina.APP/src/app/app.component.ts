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

import { IMenu } from './_interfaces/imenu';

import { AuthService } from './_services/auth.service';
import { SidedrawerService } from './_services/sidedrawer.service';
import { UIService } from './_services/ui.service';

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

  constructor(
    private authService: AuthService,
    private router: Router,
    private sideDrawerService: SidedrawerService,
    private translateService: TranslateService,
    protected override uiService: UIService
  ) {
    super(uiService);
    this.menuDataSource.data = this.sideDrawerService.mainMenu;
    this.translateService.setDefaultLang('en');
  }

  override ngOnInit(): void {
    this.initRouterEvents();
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

    if (fragment) {
      currentUrl = `${url}#${fragment}`;
    }

    return this.activatedUrl === currentUrl;
  }

  private initRouterEvents(): void {
    this.router.events
      .pipe(filter((event: any) => event instanceof NavigationEnd))
      .subscribe(
        (event: NavigationEnd) => (this.activatedUrl = event.urlAfterRedirects)
      );
  }

  hasChild = (_: number, node: IMenu) =>
    !!node.children && node.children.length > 0;
}
