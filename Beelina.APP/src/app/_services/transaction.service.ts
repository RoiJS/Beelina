import { Injectable } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client';
import { Store } from '@ngrx/store';

import { Apollo, gql, MutationResult } from 'apollo-angular';
import { map } from 'rxjs';

import { AppStateInterface } from '../_interfaces/app-state.interface';
import { Entity } from '../_models/entity.model';

import { IBaseError } from '../_interfaces/errors/ibase.error';

import { IModelNode } from './payment-method.service';

const REGISTER_TRANSACTION_MUTATION = gql`
  mutation ($transactionInput: TransactionInput!) {
    registerTransaction(input: { transactionInput: $transactionInput }) {
      transaction {
        id
      }
    }
  }
`;

export interface ITransactionPayload {
  id: number;
}

export interface ITransactionOutput {
  transaction: ITransactionPayload;
  errors: Array<IBaseError>;
}

export interface ITransactionInput {
  id: number;
  storeId: number;
  transactionDate: string;
  productTransactionInputs: Array<IProductTransactionInput>;
}

export interface IProductTransactionInput {
  id: number;
  productId: number;
  quantity: number;
  currentQuantity: number;
}

export class ProductTransaction extends Entity implements IModelNode {
  public productId: number;
  public quantity: number;
  public currentQuantity: number;
}

export class Transaction extends Entity implements IModelNode {
  public storeId: number;
  public transactionDate: Date;
  public productTransactions: Array<ProductTransaction>;

  constructor() {
    super();
    this.productTransactions = new Array<ProductTransaction>();
  }
}

export class TransactionDto {
  public id: number = 0;
  public storeId: number;
  public transactionDate: string;
  public productTransactions: Array<ProductTransaction>;
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  constructor(
    private apollo: Apollo,
    private store: Store<AppStateInterface>
  ) {}

  registerTransaction(transaction: TransactionDto) {
    const transactionInput: ITransactionInput = {
      id: transaction.id,
      storeId: transaction.storeId,
      transactionDate: transaction.transactionDate,
      productTransactionInputs: transaction.productTransactions.map((p) => {
        const productTransaction: IProductTransactionInput = {
          id: 0,
          productId: p.productId,
          quantity: p.quantity,
          currentQuantity: 0,
        };

        return productTransaction;
      }),
    };

    return this.apollo
      .mutate({
        mutation: REGISTER_TRANSACTION_MUTATION,
        variables: {
          transactionInput,
        },
      })
      .pipe(
        map(
          (
            result: MutationResult<{ registerTransaction: ITransactionOutput }>
          ) => {
            const output = result.data.registerTransaction;
            const payload = output.transaction;
            const errors = output.errors;

            if (payload) {
              return payload;
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
