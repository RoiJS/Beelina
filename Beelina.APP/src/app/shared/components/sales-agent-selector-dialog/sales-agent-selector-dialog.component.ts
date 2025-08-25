import { Component, OnInit, OnDestroy, Inject, inject, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';

import { ProductService } from 'src/app/_services/product.service';
import { NotificationService } from 'src/app/shared/ui/notification/notification.service';
import { LogMessageService } from 'src/app/_services/log-message.service';

import { User } from 'src/app/_models/user.model';
import { LogLevelEnum } from 'src/app/_enum/log-type.enum';

export interface SalesAgentSelectorConfig {
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  confirmButtonText?: string;
  allowMultipleSelection?: boolean;
  preselectedAgentIds?: number[];
  excludeAgentIds?: number[];
}

@Component({
  selector: 'app-sales-agent-selector-dialog',
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h3>{{ config.title || ('SALES_AGENT_SELECTOR_DIALOG.DEFAULT_TITLE' | translate) }}</h3>
        <p class="dialog-subtitle" *ngIf="config.subtitle">{{ config.subtitle }}</p>
      </div>

      <div class="dialog-content">
        <div class="search-container">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ config.searchPlaceholder || ('SALES_AGENT_SELECTOR_DIALOG.SEARCH_PLACEHOLDER' | translate) }}</mat-label>
            <input matInput [formControl]="searchControl" [placeholder]="config.searchPlaceholder || ('SALES_AGENT_SELECTOR_DIALOG.SEARCH_PLACEHOLDER' | translate)">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
        </div>

        <div class="agents-list-container">
          <div class="select-all-container" *ngIf="config.allowMultipleSelection">
            <mat-checkbox
              [checked]="isAllSelected()"
              [indeterminate]="isIndeterminate()"
              (change)="toggleSelectAll()">
              {{ "SALES_AGENT_SELECTOR_DIALOG.SELECT_ALL" | translate }}
            </mat-checkbox>
          </div>

          <div class="agents-list" *ngIf="filteredSalesAgents().length > 0">
            <ng-container *ngFor="let agent of filteredSalesAgents()">
              <mat-checkbox
                [checked]="isSelected(agent.id)"
                (change)="toggleAgent(agent.id)"
                class="agent-checkbox">
                <div class="agent-info">
                  <span class="agent-name">{{ agent.firstName }} {{ agent.lastName }}</span>
                  <span class="agent-username">{{ agent.username }}</span>
                </div>
              </mat-checkbox>
            </ng-container>
          </div>

          <div class="no-agents" *ngIf="filteredSalesAgents().length === 0 && salesAgents().length > 0">
            <mat-icon>search_off</mat-icon>
            <p>{{ "SALES_AGENT_SELECTOR_DIALOG.NO_AGENTS_FOUND" | translate }}</p>
          </div>

          <div class="loading" *ngIf="isLoading()">
            <mat-spinner diameter="40"></mat-spinner>
            <p>{{ "SALES_AGENT_SELECTOR_DIALOG.LOADING" | translate }}</p>
          </div>
        </div>

        <div class="selected-count" *ngIf="selectedAgentIds().length > 0">
          <ng-container *ngIf="config.allowMultipleSelection">
            {{ "SALES_AGENT_SELECTOR_DIALOG.SELECTED_COUNT" | translate: { count: selectedAgentIds().length } }}
          </ng-container>
          <ng-container *ngIf="!config.allowMultipleSelection">
            {{ "SALES_AGENT_SELECTOR_DIALOG.SELECTED_SINGLE" | translate: { name: getSelectedAgentName() } }}
          </ng-container>
        </div>
      </div>

      <div class="dialog-actions">
        <button mat-button (click)="onClose()" class="cancel-button">
          {{ "GENERAL_TEXTS.CANCEL" | translate }}
        </button>
        <button
          mat-raised-button
          color="primary"
          [disabled]="selectedAgentIds().length === 0"
          (click)="onConfirm()"
          class="confirm-button">
          {{ config.confirmButtonText || ('SALES_AGENT_SELECTOR_DIALOG.CONFIRM_BUTTON' | translate) }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 0;
      width: 100%;
    }

    .dialog-header {
      padding: 24px 24px 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .dialog-header h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
      font-weight: 500;
    }

    .dialog-subtitle {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .dialog-content {
      padding: 16px 24px;
      max-height: 400px;
      overflow-y: auto;
    }

    .search-container {
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
    }

    .select-all-container {
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e0e0e0;
    }

    .agents-list-container {
      min-height: 200px;
    }

    .agents-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .agent-checkbox, .agent-radio {
      display: flex;
      align-items: center;
      width: 100%;
      padding: 8px 0;
    }

    .agent-info {
      display: flex;
      flex-direction: column;
      margin-left: 8px;
    }

    .agent-name {
      font-weight: 500;
      font-size: 14px;
    }

    .agent-username {
      font-size: 12px;
      color: #666;
    }

    .no-agents, .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
      color: #666;
    }

    .no-agents mat-icon, .loading mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .selected-count {
      margin-top: 16px;
      padding: 8px 12px;
      background-color: #e3f2fd;
      border-radius: 4px;
      font-size: 14px;
      color: #1976d2;
      text-align: center;
    }

    .dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .cancel-button {
      color: #666;
    }

    .confirm-button {
      min-width: 120px;
    }
  `]
})
export class SalesAgentSelectorDialogComponent implements OnInit, OnDestroy {
  private _destroy$ = new Subject<void>();

  bottomSheetRef = inject(MatBottomSheetRef<SalesAgentSelectorDialogComponent>);
  productService = inject(ProductService);
  translateService = inject(TranslateService);
  notificationService = inject(NotificationService);
  loggerService = inject(LogMessageService);

  searchControl = new FormControl('');
  salesAgents = signal<User[]>([]);
  filteredSalesAgents = signal<User[]>([]);
  selectedAgentIds = signal<number[]>([]);
  isLoading = signal<boolean>(true);

  config: SalesAgentSelectorConfig;

  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: SalesAgentSelectorConfig) {
    this.config = {
      allowMultipleSelection: true,
      preselectedAgentIds: [],
      excludeAgentIds: [],
      ...data
    };
  }

  ngOnInit() {
    this.loadSalesAgents();
    this.setupSearch();

    // Set preselected agents if provided
    if (this.config.preselectedAgentIds?.length > 0) {
      this.selectedAgentIds.set([...this.config.preselectedAgentIds]);
    }
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private loadSalesAgents() {
    this.isLoading.set(true);
    this.productService.getSalesAgentsList()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (agents: User[]) => {
          // Filter out excluded agents
          let filteredAgents = agents;
          if (this.config.excludeAgentIds?.length > 0) {
            filteredAgents = agents.filter(agent =>
              !this.config.excludeAgentIds.includes(agent.id)
            );
          }

          this.salesAgents.set(filteredAgents);
          this.filteredSalesAgents.set(filteredAgents);
          this.isLoading.set(false);
        },
        error: (error) => {
          this.loggerService.logMessage(LogLevelEnum.ERROR, 'Failed to load sales agents: ' + error);
          this.notificationService.openErrorNotification(
            this.translateService.instant('SALES_AGENT_SELECTOR_DIALOG.ERROR_LOADING_AGENTS')
          );
          this.isLoading.set(false);
        }
      });
  }

  private setupSearch() {
    this.searchControl.valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe(searchTerm => {
        this.filterAgents(searchTerm || '');
      });
  }

  private filterAgents(searchTerm: string) {
    const filtered = this.salesAgents().filter(agent =>
      agent.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    this.filteredSalesAgents.set(filtered);
  }

  toggleAgent(agentId: number) {
    const currentSelected = this.selectedAgentIds();
    const index = currentSelected.indexOf(agentId);

    if (!this.config.allowMultipleSelection) {
      // For single selection mode, allow toggle behavior (select/deselect)
      if (index > -1) {
        // If already selected, deselect it
        this.selectedAgentIds.set([]);
      } else {
        // If not selected, select it (and deselect any other)
        this.selectedAgentIds.set([agentId]);
      }
      return;
    }

    // For multiple selection mode
    if (index > -1) {
      // Remove from selection
      this.selectedAgentIds.set(currentSelected.filter(id => id !== agentId));
    } else {
      // Add to selection
      this.selectedAgentIds.set([...currentSelected, agentId]);
    }
  }

  selectSingleAgent(agentId: number) {
    this.selectedAgentIds.set([agentId]);
  }

  isSelected(agentId: number): boolean {
    return this.selectedAgentIds().includes(agentId);
  }

  getSelectedAgentName(): string {
    if (this.selectedAgentIds().length === 0) return '';

    const selectedId = this.selectedAgentIds()[0];
    const selectedAgent = this.salesAgents().find(agent => agent.id === selectedId);

    return selectedAgent ? `${selectedAgent.firstName} ${selectedAgent.lastName}` : '';
  }

  isAllSelected(): boolean {
    return this.filteredSalesAgents().length > 0 &&
           this.filteredSalesAgents().every(agent => this.isSelected(agent.id));
  }

  isIndeterminate(): boolean {
    const selectedCount = this.filteredSalesAgents().filter(agent => this.isSelected(agent.id)).length;
    return selectedCount > 0 && selectedCount < this.filteredSalesAgents().length;
  }

  toggleSelectAll() {
    if (!this.config.allowMultipleSelection) return;

    if (this.isAllSelected()) {
      // Deselect all filtered agents
      const filteredIds = this.filteredSalesAgents().map(agent => agent.id);
      const newSelected = this.selectedAgentIds().filter(id => !filteredIds.includes(id));
      this.selectedAgentIds.set(newSelected);
    } else {
      // Select all filtered agents
      const filteredIds = this.filteredSalesAgents().map(agent => agent.id);
      const currentSelected = this.selectedAgentIds();
      const newSelected = [...new Set([...currentSelected, ...filteredIds])];
      this.selectedAgentIds.set(newSelected);
    }
  }

  onConfirm() {
    if (this.selectedAgentIds().length > 0) {
      this.bottomSheetRef.dismiss(this.selectedAgentIds());
    }
  }

  onClose() {
    this.bottomSheetRef.dismiss();
  }
}
