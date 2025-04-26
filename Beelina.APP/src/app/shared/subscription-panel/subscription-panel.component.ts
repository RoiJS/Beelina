import { Component, inject, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ApplySubscriptionService } from 'src/app/_services/apply-subscription.service';

@Component({
  selector: 'app-subscription-panel',
  templateUrl: './subscription-panel.component.html',
  styleUrls: ['./subscription-panel.component.scss']
})
export class SubscriptionPanelComponent implements OnInit {

  applySubscriptionService = inject(ApplySubscriptionService);
  bottomSheet = inject(MatBottomSheet);

  constructor() { }

  ngOnInit() {
    this.applySubscriptionService.setBottomSheet(this.bottomSheet);
  }

  subscribeHere() {
    this.applySubscriptionService.open();
  }
}
