import { Injectable, inject } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client/core';
import { Store } from '@ngrx/store';

import { Apollo, MutationResult, gql } from 'apollo-angular';
import { map, take } from 'rxjs';

import {
  endCursorSelector,
  filterKeywordSelector,
} from '../barangays/store/selectors';

import { AppStateInterface } from '../_interfaces/app-state.interface';
import { IBaseConnection } from '../_interfaces/connections/ibase.connection';

import { IBarangayInput } from '../_interfaces/inputs/ibarangay.input';
import { IBarangayOutput } from '../_interfaces/outputs/ibarangay.output';
import { Barangay } from '../_models/barangay';
import { StorageService } from './storage.service';

const UPDATE_BARANGAY_MUTATION = gql`
  mutation ($barangayInput: BarangayInput!) {
    updateBarangay(input: { barangayInput: $barangayInput }) {
      barangay {
        id
        name
      }
    }
  }
`;

const GET_BARANGAYS = gql`
  query ($cursor: String, $filterKeyword: String) {
    barangays(after: $cursor, where: { name: { contains: $filterKeyword } }) {
      edges {
        cursor
        node {
          name
        }
      }
      nodes {
        id
        name
        stores {
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

const GET_ALL_BARANGAYS = gql`
  query($userId: Int!) {
    allBarangays(userId: $userId) {
      id
      name
    }
  }
`;

const DELETE_BARANGAY_MUTATION = gql`
  mutation ($barangayId: Int!) {
    deleteBarangay(input: { barangayId: $barangayId }) {
      barangay {
        id
        name
      }
      errors {
        __typename
        ... on BarangayNotExistsError {
          message
        }
        ... on BaseError {
          message
        }
      }
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class BarangayService {

  apollo = inject(Apollo);
  store = inject(Store<AppStateInterface>);
  storageService = inject(StorageService);

  constructor() { }

  getBarangays() {
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
        query: GET_BARANGAYS,
        variables: {
          cursor,
          filterKeyword
        },
      })
      .valueChanges.pipe(
        map((result: ApolloQueryResult<{ barangays: IBaseConnection }>) => {
          const data = result.data.barangays;
          const errors = result.errors;
          const endCursor = data.pageInfo.endCursor;
          const hasNextPage = data.pageInfo.hasNextPage;
          const barangays = <Array<Barangay>>data.nodes;

          if (barangays) {
            return {
              endCursor,
              hasNextPage,
              barangays,
            };
          }

          if (errors && errors.length > 0) {
            throw new Error(errors[0].message);
          }

          return null;
        })
      );
  }

  getAllBarangays() {
    const userId = +this.storageService.getString('currentSalesAgentId');
    return this.apollo
      .watchQuery({
        query: GET_ALL_BARANGAYS,
        variables: {
          userId
        }
      })
      .valueChanges.pipe(
        map((result: ApolloQueryResult<{ allBarangays: Array<Barangay> }>) => {
          const data = result.data.allBarangays.map((b: Barangay) => {
            const barangay = new Barangay();
            barangay.id = b.id;
            barangay.name = b.name;
            return barangay;
          });

          return data;
        })
      );
  }

  updateBarangay(barangay: Barangay) {
    const barangayInput: IBarangayInput = {
      id: barangay.id,
      name: barangay.name,
    };

    return this.apollo
      .mutate({
        mutation: UPDATE_BARANGAY_MUTATION,
        variables: {
          barangayInput,
        },
      })
      .pipe(
        map((result: MutationResult<{ updateBarangay: IBarangayOutput }>) => {
          const output = result.data.updateBarangay;
          const payload = output.barangay;
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

  deleteBarangay(barangayId: number) {
    return this.apollo
      .mutate({
        mutation: DELETE_BARANGAY_MUTATION,
        variables: {
          barangayId,
        },
      })
      .pipe(
        map((result: MutationResult<{ deleteBarangay: IBarangayOutput }>) => {
          const output = result.data.deleteBarangay;
          const payload = output.barangay;
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
