import { Injectable } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client';
import { Store } from '@ngrx/store';

import { Apollo, gql } from 'apollo-angular';
import { map, take } from 'rxjs';
import { endCursorSelector } from '../payment-methods/store/selectors';

import { AppStateInterface } from '../_interfaces/app-state.interface';

import { Entity } from '../_models/entity.model';

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

export interface IBaseConnection {
  edges: IEdge[];
  nodes: IModelNode[];
  pageInfo: IPageInfo;
}

export interface IEdge {
  cursor: string;
  node: IModelNode;
}

export interface IModelNode {}

export interface IPageInfo {
  endCursor: string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string;
}

export class PaymentMethod extends Entity implements IModelNode {
  public name: string;

  constructor() {
    super();
  }
}

@Injectable({ providedIn: 'root' })
export class PaymentMethodService {
  constructor(
    private apollo: Apollo,
    private store: Store<AppStateInterface>
  ) {}

  getPaymentMethods() {
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
