import { Component, inject, OnInit } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { TranslateService } from '@ngx-translate/core';

import { GenerateReportOptionEnum } from 'src/app/_enum/generate-report-option.enum';
import { ApplySubscriptionService } from 'src/app/_services/apply-subscription.service';
import { ClientSubscriptionDetails } from 'src/app/_models/client-subscription-details.model';
import { LocalClientSubscriptionDbService } from 'src/app/_services/local-db/local-client-subscription-db.service';

@Component({
  selector: 'app-report-generate-option-dialog',
  templateUrl: './report-generate-option-dialog.component.html',
  styleUrls: ['./report-generate-option-dialog.component.scss']
})
export class ReportGenerateOptionDialogComponent implements OnInit {

  clientSubscriptionDetails: ClientSubscriptionDetails;

  applySubscriptionService = inject(ApplySubscriptionService);
  bottomSheet = inject(MatBottomSheet);
  localClientSubscriptionDbService = inject(LocalClientSubscriptionDbService);
  bottomSheetRef = inject(MatBottomSheetRef<ReportGenerateOptionDialogComponent>);
  translateService = inject(TranslateService);

  constructor() {
    this.applySubscriptionService.setBottomSheet(this.bottomSheet);
  }

  async ngOnInit() {
    this.clientSubscriptionDetails = await this.localClientSubscriptionDbService.getLocalClientSubsription();
  }

  onCancel() {
    this.bottomSheetRef.dismiss();
  }

  download() {
    this.bottomSheetRef.dismiss({
      generateReportOption: GenerateReportOptionEnum.DOWNLOAD
    });
  }

  sendEmail() {
    if (!this.clientSubscriptionDetails.sendReportEmailActive) {
      this.applySubscriptionService.open(this.translateService.instant("SUBSCRIPTION_TEXTS.SEND_EMAIL_REPORT_ERROR"));
      return;
    }

    this.bottomSheetRef.dismiss({
      generateReportOption: GenerateReportOptionEnum.SEND_EMAIL
    });
  }
}
