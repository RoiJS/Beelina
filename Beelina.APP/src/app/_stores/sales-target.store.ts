import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { inject } from "@angular/core";
import { Observable, EMPTY, of } from "rxjs";
import { tap, catchError, map } from "rxjs/operators";

import { IBaseStateConnection } from "../_interfaces/states/ibase-connection.state";
import { IBaseState } from "../_interfaces/states/ibase.state";
import { SalesTarget } from "../_models/sales-target.model";
import { SalesTargetProgress } from "../_models/sales-target-progress.model";
import { SalesTargetSummary } from "../_models/sales-target-summary.model";
import { StoreWithoutOrder } from "../_models/store-without-order.model";
import { SalesTargetService } from "../_services/sales-target.service";
import { SalesTargetPeriodType } from "../_enum/sales-target-period-type.enum";
import { SortOrderOptionsEnum } from "../_enum/sort-order-options.enum";
import { DateFormatter } from "../_helpers/formatters/date-formatter.helper";

export interface ISalesTargetState extends IBaseState, IBaseStateConnection {
  salesTargets: Array<SalesTarget>;
  salesTargetProgress: Array<SalesTargetProgress>;
  salesTargetSummary: SalesTargetSummary | null;
  storesWithoutOrders: Array<StoreWithoutOrder>;
  selectedSalesAgentId: number;
  selectedPeriodType: SalesTargetPeriodType | null;
  selectedStartDate: Date | null;
  selectedEndDate: Date | null;
  currentSalesTarget: SalesTarget | null;
  skip: number;
  take: number;
  totalCount: number;
  sortField: string;
  sortDirection: SortOrderOptionsEnum;
}

export const initialState: ISalesTargetState = {
  isLoading: false,
  isUpdateLoading: false,
  salesTargets: new Array<SalesTarget>(),
  salesTargetProgress: new Array<SalesTargetProgress>(),
  salesTargetSummary: null,
  storesWithoutOrders: new Array<StoreWithoutOrder>(),
  selectedSalesAgentId: 0,
  selectedPeriodType: null,
  selectedStartDate: null,
  selectedEndDate: null,
  currentSalesTarget: null,
  endCursor: null,
  filterKeyword: '',
  hasNextPage: false,
  error: null,
  skip: 0,
  take: 50,
  totalCount: 0,
  sortField: 'startDate',
  sortDirection: SortOrderOptionsEnum.DESCENDING,
};

export const SalesTargetStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, salesTargetService = inject(SalesTargetService)) => ({
    getSalesTargets: () => {
      patchState(store, { isLoading: true });
      return salesTargetService.getSalesTargets(
        store.selectedSalesAgentId(),
        store.selectedPeriodType(),
        null,
        null,
        store.skip(),
        store.take(),
        store.sortField(),
        store.sortDirection()
      ).subscribe({
        next: (data) => {
          patchState(store, {
            salesTargets: data.salesTargets,
            hasNextPage: data.hasNextPage,
            totalCount: data.totalCount,
            isLoading: false
          });
        },
        error: (error) => {
          patchState(store, { error: error.message, isLoading: false });
        },
      });
    },

    getSalesTargetById: (salesTargetId: number) => {
      patchState(store, { isLoading: true });
      return salesTargetService.getSalesTargetById(salesTargetId).subscribe({
        next: (salesTarget: SalesTarget) => {
          patchState(store, {
            currentSalesTarget: salesTarget,
            isLoading: false
          });
        },
        error: (error) => {
          patchState(store, { error: error.message, isLoading: false });
        },
      });
    },

    getSalesTargetProgress: (salesAgentIds: number[] = null) => {
      patchState(store, { isLoading: true });

      // If no salesAgentIds provided, use the selected sales agent ID if available
      const agentIds = salesAgentIds || (store.selectedSalesAgentId() ? [store.selectedSalesAgentId()] : null);

      return salesTargetService.getSalesTargetProgress(
        agentIds,
        store.selectedStartDate(),
        store.selectedEndDate()
      ).subscribe({
        next: (progress: Array<SalesTargetProgress>) => {
          patchState(store, {
            salesTargetProgress: progress,
            isLoading: false
          });
        },
        error: (error) => {
          patchState(store, { error: error.message, isLoading: false });
        },
      });
    },

    getSalesTargetSummary: (salesAgentIds: number[] = null): Observable<SalesTargetSummary> | void => {
      if (!store.selectedStartDate() || !store.selectedEndDate()) {
        patchState(store, { error: 'Start date and end date are required for summary' });
        return;
      }

      patchState(store, { isLoading: true });
      return salesTargetService.getSalesTargetSummary(
        store.selectedStartDate(),
        store.selectedEndDate(),
        salesAgentIds
      ).pipe(
        tap((summary: SalesTargetSummary) => {
          patchState(store, {
            salesTargetSummary: summary,
            isLoading: false
          });
        }),
        catchError((error) => {
          patchState(store, { error: error.message, isLoading: false });
          return EMPTY;
        })
      );
    },

    updateSalesTarget: (salesTarget: SalesTarget): Observable<{ success: boolean; error?: string; salesTarget?: SalesTarget }> => {
      patchState(store, { isUpdateLoading: true });

      const salesTargetInput = {
        id: salesTarget.id,
        salesAgentId: salesTarget.salesAgentId,
        targetAmount: salesTarget.targetAmount,
        periodType: salesTarget.periodType,
        startDate: DateFormatter.format(salesTarget.startDate),
        endDate: DateFormatter.format(salesTarget.endDate),
        description: salesTarget.description,
      };

      return salesTargetService.updateSalesTarget(salesTargetInput).pipe(
        map((updatedSalesTarget: SalesTarget) => {
          const salesTargets = store.salesTargets();
          const index = salesTargets.findIndex(st => st.id === updatedSalesTarget.id);

          if (index >= 0) {
            salesTargets[index] = updatedSalesTarget;
          } else {
            salesTargets.unshift(updatedSalesTarget);
          }

          patchState(store, {
            salesTargets: [...salesTargets],
            currentSalesTarget: updatedSalesTarget,
            isUpdateLoading: false,
            error: null
          });

          return { success: true, salesTarget: updatedSalesTarget };
        }),
        catchError((error) => {
          patchState(store, { error: error.message, isUpdateLoading: false });
          return of({ success: false, error: error.message });
        })
      );
    },

    deleteSalesTargets: (salesTargetIds: number[]) => {
      patchState(store, { isUpdateLoading: true });
      return salesTargetService.deleteSalesTargets(salesTargetIds).subscribe({
        next: () => {
          const updatedSalesTargets = store.salesTargets().filter(st => !salesTargetIds.includes(st.id));
          patchState(store, {
            salesTargets: updatedSalesTargets,
            isUpdateLoading: false
          });
        },
        error: (error) => {
          patchState(store, { error: error.message, isUpdateLoading: false });
        },
      });
    },

    setSelectedSalesAgent: (salesAgentId: number) => {
      patchState(store, { selectedSalesAgentId: salesAgentId });
    },

    setSelectedPeriodType: (periodType: SalesTargetPeriodType) => {
      patchState(store, { selectedPeriodType: periodType });
    },

    setSelectedDateRange: (startDate: Date, endDate: Date) => {
      patchState(store, {
        selectedStartDate: startDate,
        selectedEndDate: endDate
      });
    },

    setCurrentSalesTarget: (salesTarget: SalesTarget) => {
      patchState(store, { currentSalesTarget: salesTarget });
    },

    setSearchFilter: (keyword: string) => {
      patchState(store, { filterKeyword: keyword });
    },

    setPagination: (skip: number, take: number) => {
      patchState(store, { skip: skip, take: take });
    },

    setSort: (sortField: string, sortDirection: SortOrderOptionsEnum) => {
      patchState(store, { sortField: sortField, sortDirection: sortDirection });
    },

    reset: () => {
      patchState(store, { ...initialState })
    },

    resetSalesTargets: () => {
      patchState(store, {
        salesTargets: initialState.salesTargets,
        endCursor: initialState.endCursor,
        skip: initialState.skip,
        totalCount: initialState.totalCount
      });
    },

    resetProgress: () => {
      patchState(store, {
        salesTargetProgress: initialState.salesTargetProgress,
        salesTargetSummary: initialState.salesTargetSummary,
        storesWithoutOrders: initialState.storesWithoutOrders
      });
    },

    clearError: () => {
      patchState(store, { error: null });
    }
  }))
);
