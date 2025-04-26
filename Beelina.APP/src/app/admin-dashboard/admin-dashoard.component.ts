import { Component, inject, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';

import { ClientSubscriptionDetails } from '../_models/client-subscription-details.model';
import { ApplySubscriptionService } from '../_services/apply-subscription.service';
import { AuthService } from '../_services/auth.service';
import { LocalClientSubscriptionDbService } from '../_services/local-db/local-client-subscription-db.service';
import { UIService } from '../_services/ui.service';
import { SharedComponent } from '../shared/components/shared/shared.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-dashoard',
  templateUrl: './admin-dashoard.component.html',
  styleUrls: ['./admin-dashoard.component.scss']
})
export class AdminDashoardComponent extends SharedComponent implements OnInit {

  clientSubscriptionDetails: ClientSubscriptionDetails;

  applySubscriptionService = inject(ApplySubscriptionService);
  bottomSheet = inject(MatBottomSheet);
  localClientSubscriptionDbService = inject(LocalClientSubscriptionDbService);
  router = inject(Router);
  translateService = inject(TranslateService);

  constructor(private authService: AuthService,
    override uiService: UIService) {
    super(uiService);

    this.applySubscriptionService.setBottomSheet(this.bottomSheet);
  }

  override async ngOnInit() {
    super.ngOnInit();
    this.clientSubscriptionDetails = await this.localClientSubscriptionDbService.getLocalClientSubsription();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
  }

  override ngAfterContentChecked() {
    super.ngAfterContentChecked();
  }

  goToPage(url: string) {

    if (url === '/dashboard/distribution') {
      if (!this.clientSubscriptionDetails.dashboardDistributionPageActive) {
        this.applySubscriptionService.open(this.translateService.instant("SUBSCRIPTION_TEXTS.DASHBOARD_DISTRIBUTION_PAGE_ACTIVE_NO_ACCESS_ERROR"));
        return;
      }
    }

    this.router.navigate([url]);
  }

  signOut() {
    this.authService.logout();
  }
}
