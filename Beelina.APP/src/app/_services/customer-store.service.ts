import { Injectable } from '@angular/core';
import { map, take } from 'rxjs';

import { Store } from '@ngrx/store';

import { ApolloQueryResult } from '@apollo/client';
import { Apollo, gql, MutationResult } from 'apollo-angular';

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

const UPDATE_STORE_MUTATION = gql`
  mutation ($storeInput: StoreInput!) {
    updateStore(input: { storeInput: $storeInput }) {
      store {
        id
        name
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
      paymentMethod {
        id
        name
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
        paymentMethod {
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
  constructor(
    private apollo: Apollo,
    private store: Store<AppStateInterface>
  ) {}

  updateStoreInformation(store: CustomerStore) {
    const storeInput: IStoreInput = {
      id: store.id,
      name: store.name,
      address: store.address,
      paymentMethodInput: {
        id: store.paymentMethod.id,
        name: store.paymentMethod.name,
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
              return customer;
            });

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
}
