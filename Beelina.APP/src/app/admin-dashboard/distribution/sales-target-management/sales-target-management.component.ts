import { Component, inject, OnInit, signal, input, effect, ViewChild } from '@angular/core';

import { SalesTarget } from '../../../_models/sales-target.model';
import { SalesTargetStore } from '../../../_stores/sales-target.store';
import { SalesTargetPeriodType } from '../../../_enum/sales-target-period-type.enum';
import { SalesTargetDialogComponent, SalesTargetDialogData } from './sales-target-dialog/sales-target-dialog.component';
import { UserAccountService } from '../../../_services/user-account.service';
import { User } from '../../../_models/user.model';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { SortOrderOptionsEnum } from '../../../_enum/sort-order-options.enum';
import { DialogService } from '../../../shared/ui/dialog/dialog.service';
import { NotificationService } from '../../../shared/ui/notification/notification.service';
import { ButtonOptions } from 'src/app/_enum/button-options.enum';

@Component({
  selector: 'app-sales-target-management',
  templateUrl: './sales-target-management.component.html',
  styleUrls: ['./sales-target-management.component.scss']
})
export class SalesTargetManagementComponent implements OnInit {
  private readonly salesTargetStore = inject(SalesTargetStore);
  private readonly userAccountService = inject(UserAccountService);
  private readonly dialog = inject(MatDialog);
  private readonly notificationService = inject(NotificationService);
  private readonly dialogService = inject(DialogService);

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  // Input to receive the selected sales agent
  selectedSalesAgent = input<User | null>(null);

  salesTargets = this.salesTargetStore.salesTargets;
  isLoading = this.salesTargetStore.isLoading;
  totalCount = this.salesTargetStore.totalCount;
  salesAgents = signal<User[]>([]);

  displayedColumns: string[] = ['targetAmount', 'dateRange', 'actions'];

  constructor() {
    // Effect to reload sales targets when selected agent changes
    effect(() => {
      const agent = this.selectedSalesAgent();
      if (agent) {
        this.salesTargetStore.setSelectedSalesAgent(agent.id);
        this.salesTargetStore.resetSalesTargets();
        this.loadSalesTargets();
      } else {
        this.salesTargetStore.resetSalesTargets();
      }
    }, {
      allowSignalWrites: true
    });
  }

  ngOnInit(): void {
    this.loadSalesAgents();
  }

  loadSalesTargets(): void {
    this.salesTargetStore.getSalesTargets();
  }

  onPageChange(e: PageEvent): void {
    if (this.salesTargetStore.take() !== e.pageSize) {
      this.salesTargetStore.setPagination(0, e.pageSize);
    } else {
      this.salesTargetStore.setPagination(e.pageIndex * e.pageSize, e.pageSize);
    }
    this.loadSalesTargets();
  }

  onSortChange(e: Sort): void {
    const sortDirection = e.direction === 'asc' ? SortOrderOptionsEnum.ASCENDING : SortOrderOptionsEnum.DESCENDING;
    this.salesTargetStore.setSort(e.active, sortDirection);
    this.salesTargetStore.resetSalesTargets();
    this.loadSalesTargets();
  }

  loadSalesAgents(): void {
    this.userAccountService.getUserAccounts().subscribe({
      next: (response) => {
        this.salesAgents.set(response.userAccounts);
      },
      error: (error) => {
        console.error('Error loading sales agents:', error);
      }
    });
  }

  openAddDialog(): void {
    const selectedAgent = this.selectedSalesAgent();
    if (!selectedAgent) {
      this.notificationService.openWarningNotification('Please select a sales agent first');
      return;
    }

    const dialogData: SalesTargetDialogData = {
      selectedAgent: selectedAgent,
      isEdit: false
    };

    const dialogRef = this.dialog.open(SalesTargetDialogComponent, {
      width: '500px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((result: SalesTarget) => {
      if (result) {
        // The updateSalesTarget is now handled within the dialog component
        // The result here is the successfully created/updated sales target
        this.notificationService.openSuccessNotification('Sales target created successfully');
        // Reload the sales targets list to show the newly created target
        this.loadSalesTargets();
      }
    });
  }

  openEditDialog(target: SalesTarget): void {
    const selectedAgent = this.selectedSalesAgent();
    if (!selectedAgent) {
      this.notificationService.openWarningNotification('Please select a sales agent first');
      return;
    }

    const dialogData: SalesTargetDialogData = {
      salesTarget: target,
      selectedAgent: selectedAgent,
      isEdit: true
    };

    const dialogRef = this.dialog.open(SalesTargetDialogComponent, {
      width: '500px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // The updateSalesTarget is now handled within the dialog component
        // The result here is the successfully updated sales target
        this.notificationService.openSuccessNotification('Sales target updated successfully');
        // Reload the sales targets list to show the updated target
        this.loadSalesTargets();
      }
    });
  }

  deleteSalesTarget(target: SalesTarget): void {
    const selectedAgent = this.selectedSalesAgent();
    const confirmationTitle = 'Confirm Delete Sales Target';
    const confirmationMessage = `Are you sure you want to delete the sales target for ${selectedAgent?.firstName} ${selectedAgent?.lastName}? This action cannot be undone.`;

    this.dialogService.openConfirmation(confirmationTitle, confirmationMessage)
      .subscribe((result: ButtonOptions) => {
        if (result == ButtonOptions.YES) {
          this.salesTargetStore.deleteSalesTargets([target.id]);
          this.notificationService.openSuccessNotification('Sales target deleted successfully');
          // Reload the sales targets list to reflect the deletion
          this.loadSalesTargets();
        }
      });
  }

  getPeriodTypeDisplay(periodType: SalesTargetPeriodType): string {
    switch (periodType) {
      case SalesTargetPeriodType.Daily:
        return 'Daily';
      case SalesTargetPeriodType.Weekly:
        return 'Weekly';
      case SalesTargetPeriodType.Monthly:
        return 'Monthly';
      case SalesTargetPeriodType.Quarterly:
        return 'Quarterly';
      case SalesTargetPeriodType.Yearly:
        return 'Yearly';
      case SalesTargetPeriodType.Custom:
        return 'Custom';
      default:
        return 'Unknown';
    }
  }
}
