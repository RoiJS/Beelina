import { inject, Injectable } from '@angular/core';
import { map, take } from 'rxjs';

import { Store } from '@ngrx/store';

import { ApolloQueryResult } from '@apollo/client/core';
import { Apollo, gql, MutationResult } from 'apollo-angular';
import { TranslateService } from '@ngx-translate/core';

import { AppStateInterface } from '../_interfaces/app-state.interface';
import {
  endCursorSelector,
  filterKeywordSelector,
} from '../customer/store/selectors';
import { IStoreInformationQueryPayload } from '../_interfaces/payloads/istore-information-query.payload';
import { StoreNotExistsError } from '../_models/errors/store-not-exists.error';

import { IStoreOutput } from '../_interfaces/outputs/istore.output';
import { IStoreInput } from '../_interfaces/inputs/istore.input';
import { CustomerStore } from '../_models/customer-store';
import { IBaseConnection } from '../_interfaces/connections/ibase.connection';
import { OutletTypeEnum } from '../_enum/outlet-type.enum';
import { DateFilterEnum, DateFilterEnumLabels } from '../_enum/date-filter.enum';
import { ISalesAgentStoreOrder } from '../_interfaces/outputs/isales-agent-store-order.output';

const GET_SALES_AGENT_STORE_WITH_ORDERS = gql`
  query (
    $salesAgentIds: [Int!]!
    $fromDate: String!
    $toDate: String!
  ) {
    salesAgentStoreWithOrders(
      salesAgentIds: $salesAgentIds
      fromDate: $fromDate
      toDate: $toDate
    ) {
      salesAgentId
      storeOrders {
        storeId
        name
        barangayName
      }
    }
  }
`;

const GET_SALES_AGENT_STORE_WITHOUT_ORDERS = gql`
  query (
    $salesAgentIds: [Int!]!
    $dateFilterEnum: DateFilterEnum!
    $fromDate: String!
    $toDate: String!
  ) {
    salesAgentStoreWithoutOrders(
      salesAgentIds: $salesAgentIds
      dateFilterEnum: $dateFilterEnum
      fromDate: $fromDate
      toDate: $toDate
    ) {
      salesAgentId
      storeOrders {
        storeId
        name
        barangayName
      }
    }
  }
`;

const UPDATE_STORE_MUTATION = gql`
  mutation ($storeInput: StoreInput!) {
    updateStore(input: { storeInput: $storeInput }) {
      store {
        id
        name
        address
        emailAddress
        outletType
        paymentMethodId
        barangayId
      }
    }
  }
`;

const GET_CUSTOMER_STORES = gql`
  query ($cursor: String, $filterKeyword: String) {
    stores(after: $cursor, where: { name: { contains: $filterKeyword } }) {
      edges {
        cursor
        node {
          name
        }
      }
      nodes {
        id
        name
        address
        emailAddress
        outletType
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`;

const GET_CUSTOMER_STORES_PER_BARANGAY = gql`
  query ($barangayName: String!, $cursor: String, $filterKeyword: String) {
    storesByBarangay(
      after: $cursor
      barangayName: $barangayName
      where: { name: { contains: $filterKeyword } }
    ) {
      edges {
        cursor
        node {
          name
        }
      }
      nodes {
        id
        name
        address
        emailAddress
        outletType
        transactions {
          id
        }
        isDeletable
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`;

const GET_ALL_CUSTOMER_STORES = gql`
  query {
    allStores {
      id
      name
      address
      outletType
      paymentMethod {
        id
        name
      }
      barangay {
        id
        name
        userAccountId
      }
    }
  }
`;

const GET_CUSTOMER_STORE = gql`
  query ($storeId: Int!) {
    store(storeId: $storeId) {
      typename: __typename
      ... on StoreInformationResult {
        id
        name
        address
        emailAddress
        outletType
        paymentMethod {
          name
        }
        barangay {
          name
        }
      }
      ... on StoreNotExistsError {
        message
      }
    }
  }
`;

const DELETE_CUSTOMER = gql`
  mutation ($storeId: Int!) {
    deleteStore(input: { storeId: $storeId }) {
      store {
        name
      }
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class CustomerStoreService {
  private _cachedCustomers: ReadonlyArray<CustomerStore> | null = null;

  private apollo = inject(Apollo);
  private store = inject(Store<AppStateInterface>);
  private translateService = inject(TranslateService);

  get cachedCustomers(): ReadonlyArray<CustomerStore> | null {
    // Return a shallow copy to prevent external mutation
    return this._cachedCustomers ? [...this._cachedCustomers] : null;
  }

  /**
   * Invalidates the customers cache to prevent stale data across sessions/tenants
   */
  invalidateCustomersCache(): void {
    this._cachedCustomers = null;
  }

  /**
   * Updates the store information.
   *
   * @param {CustomerStore} store - The store object containing the updated information.
   * @return {Observable<IStoreOutput | null>} An observable that emits the updated store or null if there was an error.
   */
  updateStoreInformation(store: CustomerStore) {
    const storeInput: IStoreInput = {
      id: store.id,
      name: store.name,
      address: store.address,
      emailAddress: store.emailAddress,
      outletType: store.outletType,
      paymentMethodInput: {
        id: store.paymentMethod.id,
        name: store.paymentMethod.name,
      },
      barangayInput: {
        id: store.barangay.id,
        name: store.barangay.name,
      },
    };

    return this.apollo
      .mutate({
        mutation: UPDATE_STORE_MUTATION,
        variables: {
          storeInput,
        },
      })
      .pipe(
        map((result: MutationResult<{ updateStore: IStoreOutput }>) => {
          const output = result.data.updateStore;
          const payload = <CustomerStore>output.store;
          const errors = output.errors;

          if (payload) {
            return payload;
          }

          if (errors && errors.length > 0) {
            throw new Error(errors[0].message);
          }

          return null;
        })
      );
  }

  getCustomerStores() {
    let cursor = null,
      filterKeyword = '';

    this.store
      .select(endCursorSelector)
      .pipe(take(1))
      .subscribe((currentCursor) => (cursor = currentCursor));

    this.store
      .select(filterKeywordSelector)
      .pipe(take(1))
      .subscribe(
        (currentFilterKeyword) => (filterKeyword = currentFilterKeyword)
      );

    return this.apollo
      .watchQuery({
        query: GET_CUSTOMER_STORES,
        variables: {
          cursor,
          filterKeyword,
        },
      })
      .valueChanges.pipe(
        map((result: ApolloQueryResult<{ stores: IBaseConnection }>) => {
          const data = result.data.stores;
          const errors = result.errors;
          const endCursor = data.pageInfo.endCursor;
          const hasNextPage = data.pageInfo.hasNextPage;
          const customerStores = <Array<CustomerStore>>data.nodes;

          if (customerStores) {
            return {
              endCursor,
              hasNextPage,
              customerStores,
            };
          }

          if (errors && errors.length > 0) {
            throw new Error(errors[0].message);
          }

          return null;
        })
      );
  }

  /**
   * Retrieves the customer stores per barangay.
   *
   * @param {string} barangayName - The name of the barangay.
   * @return {Observable<any>} An observable that emits the customer stores per barangay.
   */
  getCustomerStoresPerBarangay(barangayName: string) {
    let cursor = null,
      filterKeyword = '';

    this.store
      .select(endCursorSelector)
      .pipe(take(1))
      .subscribe((currentCursor) => (cursor = currentCursor));

    this.store
      .select(filterKeywordSelector)
      .pipe(take(1))
      .subscribe(
        (currentFilterKeyword) => (filterKeyword = currentFilterKeyword)
      );

    return this.apollo
      .watchQuery({
        query: GET_CUSTOMER_STORES_PER_BARANGAY,
        variables: {
          cursor,
          filterKeyword,
          barangayName,
        },
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{ storesByBarangay: IBaseConnection }>
          ) => {
            const data = result.data.storesByBarangay;
            const errors = result.errors;
            const endCursor = data.pageInfo.endCursor;
            const hasNextPage = data.pageInfo.hasNextPage;
            const customerStores = <Array<CustomerStore>>data.nodes;

            if (customerStores) {
              return {
                endCursor,
                hasNextPage,
                customerStores,
              };
            }

            if (errors && errors.length > 0) {
              throw new Error(errors[0].message);
            }

            return null;
          }
        )
      );
  }

  getAllCustomerStores() {
    return this.apollo
      .watchQuery({
        query: GET_ALL_CUSTOMER_STORES,
      })
      .valueChanges.pipe(
        map(
          (result: ApolloQueryResult<{ allStores: Array<CustomerStore> }>) => {
            const data = result.data.allStores.map((c: CustomerStore) => {
              const customer = new CustomerStore();
              customer.id = c.id;
              customer.name = c.name;
              customer.address = c.address;
              customer.paymentMethod = c.paymentMethod;
              customer.barangay = c.barangay;
              return customer;
            });

            // Cache the customers
            this._cachedCustomers = data;
            return data;
          }
        )
      );
  }

  getCustomerStore(storeId: number) {
    return this.apollo
      .watchQuery({
        query: GET_CUSTOMER_STORE,
        variables: {
          storeId,
        },
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{ store: IStoreInformationQueryPayload }>
          ) => {
            const data = result.data.store;

            if (data.typename === 'StoreInformationResult')
              return result.data.store;
            if (data.typename === 'StoreNotExistsError')
              throw new Error((<StoreNotExistsError>result.data.store).message);

            return null;
          }
        )
      );
  }

  deleteCustomer(storeId: number) {
    return this.apollo
      .mutate({
        mutation: DELETE_CUSTOMER,
        variables: {
          storeId,
        },
      })
      .pipe(
        map((result: MutationResult<{ deleteStore: IStoreOutput }>) => {
          const output = result.data.deleteStore;
          const payload = output.store;
          const errors = output.errors;

          if (payload) {
            return payload;
          }

          if (errors && errors.length > 0) {
            throw new Error(errors[0].message);
          }

          return null;
        })
      );
  }

  /**
   * Gets all available outlet type options with translated labels
   * @param {string} pageContext - The page context for translations ('ADD_CUSTOMER_DETAILS_PAGE' or 'EDIT_CUSTOMER_DETAILS_PAGE')
   * @returns {Array<{value: OutletTypeEnum, label: string}>} Array of outlet type options
   */
  getOutletTypeOptions(pageContext: string = 'ADD_CUSTOMER_DETAILS_PAGE'): Array<{ value: OutletTypeEnum, label: string }> {
    return [
      {
        value: OutletTypeEnum.KEY_ACCOUNT,
        label: this.translateService.instant(`${pageContext}.FORM_CONTROL_SECTION.OUTLET_TYPE_CONTROL.OPTIONS.KEY_ACCOUNT`)
      },
      {
        value: OutletTypeEnum.GEN_TRADE,
        label: this.translateService.instant(`${pageContext}.FORM_CONTROL_SECTION.OUTLET_TYPE_CONTROL.OPTIONS.GEN_TRADE`)
      },
      {
        value: OutletTypeEnum.SUPERMARKET,
        label: this.translateService.instant(`${pageContext}.FORM_CONTROL_SECTION.OUTLET_TYPE_CONTROL.OPTIONS.SUPERMARKET`)
      },
      {
        value: OutletTypeEnum.GROCERY,
        label: this.translateService.instant(`${pageContext}.FORM_CONTROL_SECTION.OUTLET_TYPE_CONTROL.OPTIONS.GROCERY`)
      },
      {
        value: OutletTypeEnum.PUBLIC_MARKET_STOOL_STORE,
        label: this.translateService.instant(`${pageContext}.FORM_CONTROL_SECTION.OUTLET_TYPE_CONTROL.OPTIONS.PUBLIC_MARKET_STOOL_STORE`)
      },
      {
        value: OutletTypeEnum.SARI_SARI_STORE,
        label: this.translateService.instant(`${pageContext}.FORM_CONTROL_SECTION.OUTLET_TYPE_CONTROL.OPTIONS.SARI_SARI_STORE`)
      },
      {
        value: OutletTypeEnum.FOOD_SERVICES,
        label: this.translateService.instant(`${pageContext}.FORM_CONTROL_SECTION.OUTLET_TYPE_CONTROL.OPTIONS.FOOD_SERVICES`)
      },
      {
        value: OutletTypeEnum.CONVENIENCE_STORE,
        label: this.translateService.instant(`${pageContext}.FORM_CONTROL_SECTION.OUTLET_TYPE_CONTROL.OPTIONS.CONVENIENCE_STORE`)
      },
      {
        value: OutletTypeEnum.PHARMACY,
        label: this.translateService.instant(`${pageContext}.FORM_CONTROL_SECTION.OUTLET_TYPE_CONTROL.OPTIONS.PHARMACY`)
      },
      {
        value: OutletTypeEnum.GASOLINE_STATION,
        label: this.translateService.instant(`${pageContext}.FORM_CONTROL_SECTION.OUTLET_TYPE_CONTROL.OPTIONS.GASOLINE_STATION`)
      }
    ];
  }

  /**
   * Gets stores with orders for specific sales agents within a date range
   * @param {number[]} salesAgentIds - Array of sales agent IDs
   * @param {string} fromDate - Start date (YYYY-MM-DD format)
   * @param {string} toDate - End date (YYYY-MM-DD format)
   * @returns {Observable<ISalesAgentStoreOrder[]>} Observable of sales agent store orders
   */
  getSalesAgentStoreWithOrders(
    salesAgentIds: number[],
    fromDate: string,
    toDate: string
  ) {
    return this.apollo
      .watchQuery({
        query: GET_SALES_AGENT_STORE_WITH_ORDERS,
        variables: {
          salesAgentIds,
          fromDate,
          toDate,
        },
      })
      .valueChanges.pipe(
        map(
          (result: ApolloQueryResult<{ salesAgentStoreWithOrders: ISalesAgentStoreOrder[] }>) => {
            const data = result.data.salesAgentStoreWithOrders;
            const errors = result.errors;

            if (data) {
              return data;
            }

            if (errors && errors.length > 0) {
              throw new Error(errors[0].message);
            }

            return [];
          }
        )
      );
  }

  /**
   * Gets stores without orders for specific sales agents based on previous period analysis
   * This returns stores that had orders in the previous period but don't have orders in the current period
   * @param {number[]} salesAgentIds - Array of sales agent IDs
   * @param {DateFilterEnum} dateFilterEnum - The date filter type (Daily, Weekly, Monthly, Custom)
   * @param {string} fromDate - Start date of current period (YYYY-MM-DD format)
   * @param {string} toDate - End date of current period (YYYY-MM-DD format)
   * @returns {Observable<ISalesAgentStoreOrder[]>} Observable of sales agent store orders from previous period
   */
  getSalesAgentStoreWithoutOrders(
    salesAgentIds: number[],
    dateFilterEnum: DateFilterEnum,
    fromDate: string,
    toDate: string
  ) {
    return this.apollo
      .watchQuery({
        query: GET_SALES_AGENT_STORE_WITHOUT_ORDERS,
        variables: {
          salesAgentIds,
          dateFilterEnum: DateFilterEnumLabels[dateFilterEnum],
          fromDate,
          toDate,
        },
      })
      .valueChanges.pipe(
        map(
          (result: ApolloQueryResult<{ salesAgentStoreWithoutOrders: ISalesAgentStoreOrder[] }>) => {
            const data = result.data.salesAgentStoreWithoutOrders;
            const errors = result.errors;

            if (data) {
              return data;
            }

            if (errors && errors.length > 0) {
              throw new Error(errors[0].message);
            }

            return [];
          }
        )
      );
  }
}
