import { Injectable } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client/core';
import { Store } from '@ngrx/store';
import { Apollo, gql } from 'apollo-angular';
import { map, take } from 'rxjs';

import { endCursorSelector } from '../units/store/selectors';
import { AppStateInterface } from '../_interfaces/app-state.interface';
import { IBaseConnection } from '../_interfaces/connections/ibase.connection';
import { ProductUnit } from '../_models/product-unit';

const GET_PAYMENT_METHODS = gql`
  query ($cursor: String) {
    productUnits(after: $cursor) {
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

@Injectable({ providedIn: 'root' })
export class ProductUnitService {
  constructor(
    private apollo: Apollo,
    private store: Store<AppStateInterface>
  ) {}

  getProductUnits() {
    let cursor = null;

    this.store
      .select(endCursorSelector)
      .pipe(take(1))
      .subscribe((currentCursor) => (cursor = currentCursor));

    return this.apollo
      .watchQuery({
        query: GET_PAYMENT_METHODS,
        variables: {
          cursor,
        },
      })
      .valueChanges.pipe(
        map((result: ApolloQueryResult<{ productUnits: IBaseConnection }>) => {
          const data = result.data.productUnits;
          const errors = result.errors;
          const endCursor = data.pageInfo.endCursor;
          const hasNextPage = data.pageInfo.hasNextPage;
          const productUnits = <Array<ProductUnit>>data.nodes;

          if (productUnits) {
            return {
              endCursor,
              hasNextPage,
              productUnits,
            };
          }

          if (errors && errors.length > 0) {
            throw new Error(errors[0].message);
          }

          return null;
        })
      );
  }
}
