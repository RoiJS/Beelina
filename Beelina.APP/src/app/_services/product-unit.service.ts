import { inject, Injectable } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client/core';
import { Apollo, gql } from 'apollo-angular';
import { map } from 'rxjs';

import { IBaseConnection } from '../_interfaces/connections/ibase.connection';
import { ProductUnit } from '../_models/product-unit';

const GET_PRODUCT_UNITS = gql`
  query ($cursor: String, $limit: Int!) {
    productUnits(after: $cursor, first: $limit) {
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

  private apollo = inject(Apollo);

  getProductUnits(cursor: string, limit: number = 100) {
    return this.apollo
      .watchQuery({
        query: GET_PRODUCT_UNITS,
        variables: {
          cursor,
          limit
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
