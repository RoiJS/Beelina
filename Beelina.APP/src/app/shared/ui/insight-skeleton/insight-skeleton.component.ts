import { Component, Input } from '@angular/core';

export enum SkeletonTypeEnum {
  SUPPLIER = 'supplier',
  CUSTOMER = 'customer',
  PRODUCT = 'product'
}

@Component({
  selector: 'app-insight-skeleton',
  templateUrl: './insight-skeleton.component.html',
  styleUrls: ['./insight-skeleton.component.scss']
})
export class InsightSkeletonComponent {
  @Input() skeletonType: SkeletonTypeEnum = SkeletonTypeEnum.SUPPLIER;
  @Input() itemCount: number = 5;
  @Input() animationDelay: number = 100;

  // Create array for *ngFor based on itemCount
  get skeletonItems(): number[] {
    return Array.from({ length: this.itemCount }, (_, i) => i + 1);
  }

  // Expose enum to template
  get skeletonTypeEnum() {
    return SkeletonTypeEnum;
  }
}
