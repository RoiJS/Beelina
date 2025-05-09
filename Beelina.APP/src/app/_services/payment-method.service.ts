import { inject, Injectable } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client/core';

import { Apollo, gql } from 'apollo-angular';
import { map } from 'rxjs';

import { IBaseConnection } from '../_interfaces/connections/ibase.connection';

import { PaymentMethod } from '../_models/payment-method';

const GET_PAYMENT_METHODS = gql`
  query ($cursor: String) {
    paymentMethods(after: $cursor) {
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
export class PaymentMethodService {

  private apollo = inject(Apollo);

  getPaymentMethods() {
    let cursor = null;

    return this.apollo
      .watchQuery({
        query: GET_PAYMENT_METHODS,
        variables: {
          cursor,
        },
      })
      .valueChanges.pipe(
        map(
          (result: ApolloQueryResult<{ paymentMethods: IBaseConnection }>) => {
            const data = result.data.paymentMethods;
            const errors = result.errors;
            const endCursor = data.pageInfo.endCursor;
            const hasNextPage = data.pageInfo.hasNextPage;
            const paymentMethods = <Array<PaymentMethod>>data.nodes;

            if (paymentMethods) {
              return {
                endCursor,
                hasNextPage,
                paymentMethods,
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
}
