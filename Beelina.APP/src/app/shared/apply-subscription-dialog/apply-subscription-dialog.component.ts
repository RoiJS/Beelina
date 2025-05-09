import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { firstValueFrom } from 'rxjs';

import { BaseComponent } from '../components/base-component/base.component';
import { DialogService } from '../ui/dialog/dialog.service';
import { LocalClientSubscriptionDbService } from 'src/app/_services/local-db/local-client-subscription-db.service';
import { NotificationService } from '../ui/notification/notification.service';
import { SubscriptionService } from 'src/app/_services/subscription.service';

import { ClientSubscriptionDetails } from 'src/app/_models/client-subscription-details.model';
import { ButtonOptions } from 'src/app/_enum/button-options.enum';
import { ClientSubscription } from 'src/app/_models/client-subscription';
import { DateFormatter } from 'src/app/_helpers/formatters/date-formatter.helper';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-apply-subscription-dialog',
  templateUrl: './apply-subscription-dialog.component.html',
  styleUrls: ['./apply-subscription-dialog.component.scss'],
})
export class ApplySubscriptionDialogComponent extends BaseComponent implements OnInit {

  bottomSheetRef = inject(MatBottomSheetRef<ApplySubscriptionDialogComponent>);
  dialogService = inject(DialogService);
  formBuilder = inject(FormBuilder);
  localClientSubscriptionDbService = inject(LocalClientSubscriptionDbService);
  notificationService = inject(NotificationService);
  subscriptionService = inject(SubscriptionService);
  translateService = inject(TranslateService);

  subscriptions = signal<Array<ClientSubscriptionDetails>>([]);
  clientSubscriptionDetails: ClientSubscriptionDetails;

  data = inject<{ message: string }>(MAT_BOTTOM_SHEET_DATA);

  constructor() {
    super();
  }

  async ngOnInit() {
    this._isLoading = true;
    this.clientSubscriptionDetails = await this.localClientSubscriptionDbService.getLocalClientSubsription();
    const subscriptions = await firstValueFrom(this.subscriptionService.getSubscriptions(0));
    this.subscriptions.set(subscriptions);
    this._isLoading = false;
  }

  onCancel() {
    this.bottomSheetRef.dismiss();
  }

  subscribe(subscriptionFeature: ClientSubscriptionDetails) {
    this.dialogService.openConfirmation(this.translateService.instant("SUBSCRIPTION_TEXTS.APPLY_SUBSCRIPTION_HEADER_LABEL"), this.translateService.instant("SUBSCRIPTION_TEXTS.APPLY_SUBSCRIPTION_CONFIRMATION_MESSAGE", { subscriptionName: subscriptionFeature.subscriptionName }))
      .subscribe((result: ButtonOptions) => {
        if (result === ButtonOptions.YES) {
          const clientSubscription = new ClientSubscription();
          clientSubscription.id = 0;
          clientSubscription.startDate = DateFormatter.format(new Date());
          clientSubscription.subscriptionFeatureId = subscriptionFeature.subscriptionFeatureId;
          this.subscriptionService.updateClientSubscription(clientSubscription).subscribe({
            next: () => {
              this.notificationService.openSuccessNotification(this.translateService.instant("SUBSCRIPTION_TEXTS.APPLY_SUBSCRIPTION_SUCCESS_MESSAGE", { subscriptionName: this.clientSubscriptionDetails.subscriptionName }));
              this.bottomSheetRef.dismiss();
            },
            error: (ex) => {
              this.notificationService.openErrorNotification(ex);
            }
          });
        }
      });
  }
}
