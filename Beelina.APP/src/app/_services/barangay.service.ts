import { Injectable } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client/core';
import { Store } from '@ngrx/store';

import { Apollo, gql } from 'apollo-angular';
import { map, take } from 'rxjs';

import { endCursorSelector } from '../barangays/store/selectors';

import { AppStateInterface } from '../_interfaces/app-state.interface';
import { IBaseConnection } from '../_interfaces/connections/ibase.connection';

import { Barangay } from '../_models/barangay';

const GET_BARANGAYS = gql`
  query ($cursor: String) {
    barangays(after: $cursor) {
      edges {
        cursor
        node {
          name
        }
      }
      nodes {
        id
        name
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
  query {
    allBarangays {
      id
      name
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class BarangayService {
  constructor(
    private apollo: Apollo,
    private store: Store<AppStateInterface>
  ) {}

  getBarangays() {
    let cursor = null;

    this.store
      .select(endCursorSelector)
      .pipe(take(1))
      .subscribe((currentCursor) => (cursor = currentCursor));

    return this.apollo
      .watchQuery({
        query: GET_BARANGAYS,
        variables: {
          cursor,
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
    return this.apollo
      .watchQuery({
        query: GET_ALL_BARANGAYS,
      })
      .valueChanges.pipe(
        map(
          (result: ApolloQueryResult<{ allBarangays: Array<Barangay> }>) => {
            const data = result.data.allBarangays.map((b: Barangay) => {
              const barangay = new Barangay();
              barangay.id = b.id;
              barangay.name = b.name;
              return barangay;
            });

            return data;
          }
        )
      );
  }
}
