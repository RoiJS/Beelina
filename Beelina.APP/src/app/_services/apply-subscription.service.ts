import { inject, Injectable } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';

import { ApplySubscriptionDialogComponent } from '../shared/apply-subscription-dialog/apply-subscription-dialog.component';
import { ModuleEnum } from '../_enum/module.enum';
import { getPermissionLevelEnum, PermissionLevelEnum } from '../_enum/permission-level.enum';

import { AuthService } from './auth.service';
import { NotificationService } from '../shared/ui/notification/notification.service';

@Injectable({
  providedIn: 'root'
})
export class ApplySubscriptionService {

  protected _dialogRef: MatBottomSheetRef<ApplySubscriptionDialogComponent>;
  protected _bottomSheet: MatBottomSheet;

  authService = inject(AuthService);
  notificationService = inject(NotificationService);

  userCurrentModulePrivilege = this.authService.user.value.getModulePrivilege(ModuleEnum.Distribution);

  constructor() {

  }

  setBottomSheet(bottomSheet: MatBottomSheet) {
    this._bottomSheet = bottomSheet;
    return this;
  }

  open(message: string = '') {
    if (this.userCurrentModulePrivilege.value === getPermissionLevelEnum(PermissionLevelEnum.Administrator)) {
      this._dialogRef = this._bottomSheet.open(ApplySubscriptionDialogComponent, {
        data: {
          message
        }
      });
    } else {
      this.notificationService.openErrorNotification(message);
    }
  }
}
