import { Injectable, inject } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client/core';

import { Apollo, MutationResult, gql } from 'apollo-angular';
import { map } from 'rxjs/operators';

import { IBaseConnection } from '../_interfaces/connections/ibase.connection';
import { SalesTarget } from '../_models/sales-target.model';
import { SalesTargetProgress } from '../_models/sales-target-progress.model';
import { SalesTargetSummary } from '../_models/sales-target-summary.model';
import { StoreWithoutOrder } from '../_models/store-without-order.model';
import { SalesTargetPeriodType } from '../_enum/sales-target-period-type.enum';
import { SortOrderOptionsEnum } from '../_enum/sort-order-options.enum';

const UPDATE_SALES_TARGET_MUTATION = gql`
  mutation($salesTargetInput: SalesTargetInput!) {
    updateSalesTarget(input: { salesTargetInput: $salesTargetInput}) {
        salesTarget {
            id
            salesAgentId
            targetAmount
            periodType
            startDate
            endDate
            description
        }
    }
  }
`;

const DELETE_SALES_TARGETS_MUTATION = gql`
  mutation($salesTargetIds: [Int!]!) {
    deleteSalesTargets(input: { salesTargetIds: $salesTargetIds }) {
      boolean
    }
  }
`;

const GET_SALES_TARGETS = gql`
  query (
    $salesAgentId: Int,
    $periodType: SalesTargetPeriodTypeEnum,
    $startDate: DateTime,
    $endDate: DateTime,
    $skip: Int!,
    $take: Int!,
    $order: [SalesTargetSortInput!]
  ){
    salesTargets (
      salesAgentId: $salesAgentId,
      periodType: $periodType,
      startDate: $startDate,
      endDate: $endDate,
      order: $order,
      skip: $skip,
      take: $take
    ) {
        items {
          id
          salesAgentId
          targetAmount
          periodType
          startDate
          endDate
          description
          isActive
          salesAgent {
            id
            firstName
            lastName
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
        totalCount
    }
  }
`;

const GET_SALES_TARGET_BY_ID = gql`
  query ($salesTargetId: Int!) {
    salesTargetById(salesTargetId: $salesTargetId) {
      id
      salesAgentId
      targetAmount
      periodType
      startDate
      endDate
      description
      isActive
      salesAgent {
        id
        firstName
        lastName
      }
    }
  }
`;

const GET_SALES_TARGET_PROGRESS = gql`
  query ($salesAgentIds: [Int!]!, $fromDate: DateTime, $toDate: DateTime) {
    salesTargetProgress(salesAgentIds: $salesAgentIds, fromDate: $fromDate, toDate: $toDate) {
      id
      salesAgentId
      salesAgentName
      targetAmount
      periodType
      startDate
      endDate
      description
      currentSales
      remainingSales
      completionPercentage
      daysRemaining
      targetSalesPerDay
      storesWithoutOrders
      targetSalesPerStore
      totalStores
      isOverdue
      isTargetMet
      dailyAverageSales
      daysElapsed
      totalDays
    }
  }
`;

const GET_SALES_TARGET_SUMMARY = gql`
  query ($fromDate: DateTime!, $toDate: DateTime!, $salesAgentIds: [Int!]) {
    salesTargetSummary(fromDate: $fromDate, toDate: $toDate, salesAgentIds: $salesAgentIds) {
      dateFrom
      dateTo
      salesTargets {
        id
        salesAgentId
        salesAgentName
        targetAmount
        periodType
        startDate
        endDate
        description
        currentSales
        remainingSales
        completionPercentage
        daysRemaining
        targetSalesPerDay
        storesWithoutOrders
        targetSalesPerStore
        totalStores
        isOverdue
        isTargetMet
        dailyAverageSales
        daysElapsed
        totalDays
      }
      totalTargetAmount
      totalCurrentSales
      totalRemainingSales
      overallCompletionPercentage
      totalSalesAgents
      salesAgentsOnTarget
      salesAgentsBehindTarget
      totalStoresWithoutOrders
    }
  }
`;

export interface ISalesTargetInput {
  id: number;
  salesAgentId: number;
  targetAmount: number;
  periodType: SalesTargetPeriodType;
  startDate: string;
  endDate: string;
  description: string;
}

export interface ISalesTargetOutput {
  updateSalesTarget: ISalesTargetOutputResult;
}

export interface ISalesTargetOutputResult {
  salesTarget: SalesTarget;
}

export interface ISalesTargetsOutput {
  salesTargets: {
    items: SalesTarget[];
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
    totalCount: number;
  };
}

export interface ISalesTargetProgressOutput {
  salesTargetProgress: SalesTargetProgress[];
}

export interface ISalesTargetSummaryOutput {
  salesTargetSummary: SalesTargetSummary;
}

export interface IStoresWithoutOrdersOutput {
  storesWithoutOrders: StoreWithoutOrder[];
}

export interface IActualSalesOutput {
  actualSalesForPeriod: number;
}

@Injectable({
  providedIn: 'root'
})
export class SalesTargetService {

  private apollo = inject(Apollo);

  getSalesTargets(
    salesAgentId: number = 0,
    periodType: SalesTargetPeriodType = null,
    startDate: Date = null,
    endDate: Date = null,
    skip: number = 0,
    take: number = 50,
    sortField: string = 'startDate',
    sortDirection: SortOrderOptionsEnum = SortOrderOptionsEnum.DESCENDING
  ) {
    let order: any = {
      [sortField]: sortDirection
    };

    return this.apollo
      .watchQuery<ISalesTargetsOutput>({
        query: GET_SALES_TARGETS,
        variables: {
          salesAgentId: salesAgentId > 0 ? salesAgentId : null,
          periodType,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          skip,
          take,
          order
        },
        errorPolicy: 'all',
      })
      .valueChanges.pipe(
        map((result: ApolloQueryResult<ISalesTargetsOutput>) => {
          const data = result.data.salesTargets;
          return {
            salesTargets: data.items,
            hasNextPage: data.pageInfo.hasNextPage,
            hasPreviousPage: data.pageInfo.hasPreviousPage,
            totalCount: data.totalCount
          };
        })
      );
  }

  getSalesTargetById(salesTargetId: number) {
    return this.apollo
      .watchQuery<{ salesTargetById: SalesTarget }>({
        query: GET_SALES_TARGET_BY_ID,
        variables: {
          salesTargetId
        },
        errorPolicy: 'all',
      })
      .valueChanges.pipe(
        map((result: ApolloQueryResult<{ salesTargetById: SalesTarget }>) => {
          return result.data.salesTargetById;
        })
      );
  }

  getSalesTargetProgress(
    salesAgentIds: number[] = null,
    fromDate: Date = null,
    toDate: Date = null
  ) {
    return this.apollo
      .watchQuery<ISalesTargetProgressOutput>({
        query: GET_SALES_TARGET_PROGRESS,
        variables: {
          salesAgentIds: salesAgentIds && salesAgentIds.length > 0 ? salesAgentIds : null,
          fromDate: fromDate?.toISOString(),
          toDate: toDate?.toISOString()
        },
        errorPolicy: 'all',
      })
      .valueChanges.pipe(
        map((result: ApolloQueryResult<ISalesTargetProgressOutput>) => {
          return result.data.salesTargetProgress;
        })
      );
  }

  getSalesTargetSummary(
    fromDate: Date,
    toDate: Date,
    salesAgentIds: number[] = null
  ) {
    return this.apollo
      .watchQuery<ISalesTargetSummaryOutput>({
        query: GET_SALES_TARGET_SUMMARY,
        variables: {
          fromDate: fromDate.toISOString(),
          toDate: toDate.toISOString(),
          salesAgentIds
        },
        errorPolicy: 'all',
      })
      .valueChanges.pipe(
        map((result: ApolloQueryResult<ISalesTargetSummaryOutput>) => {
          return result.data.salesTargetSummary;
        })
      );
  }

  updateSalesTarget(salesTargetInformation: ISalesTargetInput) {
    return this.apollo
      .mutate<ISalesTargetOutput>({
        mutation: UPDATE_SALES_TARGET_MUTATION,
        variables: {
          salesTargetInput: salesTargetInformation,
        },
        errorPolicy: 'all',
      })
      .pipe(
        map((result: MutationResult<ISalesTargetOutput>) => {
          return result.data.updateSalesTarget.salesTarget;
        })
      );
  }

  deleteSalesTargets(salesTargetIds: Array<number>) {
    return this.apollo
      .mutate<{ deleteSalesTargets: { boolean: boolean } }>({
        mutation: DELETE_SALES_TARGETS_MUTATION,
        variables: {
          salesTargetIds,
        },
        errorPolicy: 'all',
      })
      .pipe(
        map((result: MutationResult<{ deleteSalesTargets: { boolean: boolean } }>) => {
          return result.data?.deleteSalesTargets.boolean;
        })
      );
  }
}
