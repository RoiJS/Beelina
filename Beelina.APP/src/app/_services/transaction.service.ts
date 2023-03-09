import { Injectable } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client';
import { Store } from '@ngrx/store';

import { Apollo, gql, MutationResult } from 'apollo-angular';
import { map } from 'rxjs';

import { AppStateInterface } from '../_interfaces/app-state.interface';
import { Entity } from '../_models/entity.model';

import { IBaseError } from '../_interfaces/errors/ibase.error';

import { IModelNode } from './payment-method.service';
import { CustomerStore } from './customer-store.service';
import { Product } from './product.service';

import { PaymenStatusEnum } from '../_enum/payment-status.enum';
import { DateFormatter } from '../_helpers/formatters/date-formatter.helper';

const REGISTER_TRANSACTION_MUTATION = gql`
  mutation ($transactionInput: TransactionInput!) {
    registerTransaction(input: { transactionInput: $transactionInput }) {
      transaction {
        id
      }
    }
  }
`;

const GET_TRANSACTION_HISTORY_DATES = gql`
  query ($transactionDate: String!) {
    transactionDates(transactionDate: $transactionDate) {
      transactionDate
      allTransactionsPaid
    }
  }
`;

const GET_TRANSACTIONS_BY_DATE = gql`
  query ($transactionDate: String!) {
    transactionsByDate(transactionDate: $transactionDate) {
      id
      storeId
      transactionDate
      hasUnpaidProductTransaction
      store {
        name
      }
    }
  }
`;

const GET_TRANSACTION = gql`
  query ($transactionId: Int!) {
    transaction(transactionId: $transactionId) {
      id
      storeId
      transactionDate
      hasUnpaidProductTransaction
      store {
        name
      }
      productTransactions {
        id
        transactionId
        productId
        quantity
        status
        product {
          id
          name
          price
        }
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
  public status: PaymenStatusEnum;
  public product: Product;
}

export class Transaction extends Entity implements IModelNode {
  public storeId: number;
  public transactionDate: Date;
  public store: CustomerStore;
  public productTransactions: Array<ProductTransaction>;
  public hasUnpaidProductTransaction: boolean;

  constructor() {
    super();
    this.productTransactions = new Array<ProductTransaction>();
  }
}

export class TransactionHistoryDate {
  public transactionDate: Date;
  public allTransactionsPaid: boolean;

  get transactionDateFormatted(): string {
    return DateFormatter.format(this.transactionDate, 'MMM DD, YYYY');
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
  constructor(private apollo: Apollo) {}

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

  getTransactionsByDate(transactionDate: string) {
    return this.apollo
      .watchQuery({
        query: GET_TRANSACTIONS_BY_DATE,
        variables: {
          transactionDate,
        },
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{
              transactionsByDate: Array<Transaction>;
            }>
          ) => {
            return result.data.transactionsByDate.map((t) => {
              const transaction = new Transaction();
              transaction.id = t.id;
              transaction.storeId = t.storeId;
              transaction.store = t.store;
              transaction.hasUnpaidProductTransaction =
                t.hasUnpaidProductTransaction;
              return transaction;
            });
          }
        )
      );
  }

  getTransaction(transactionId: number) {
    return this.apollo
      .watchQuery({
        query: GET_TRANSACTION,
        variables: {
          transactionId,
        },
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{
              transaction: Transaction;
            }>
          ) => {
            const transactionFromRepo = result.data.transaction;

            const transaction = new Transaction();
            transaction.id = transactionFromRepo.id;
            transaction.storeId = transactionFromRepo.storeId;
            transaction.store = transactionFromRepo.store;
            transaction.hasUnpaidProductTransaction =
              transactionFromRepo.hasUnpaidProductTransaction;
            transaction.productTransactions =
              transactionFromRepo.productTransactions.map((pt) => {
                const productTransaction = new ProductTransaction();
                productTransaction.id = pt.id;
                productTransaction.quantity = pt.quantity;
                productTransaction.status = pt.status;
                productTransaction.product = new Product();
                productTransaction.product.id = pt.product.id;
                productTransaction.product.name = pt.product.name;
                productTransaction.product.price = pt.product.price;
                return productTransaction;
              });

            return transaction;
          }
        )
      );
  }

  getTransactioHistoryDates(transactionDate: string = '') {
    return this.apollo
      .watchQuery({
        query: GET_TRANSACTION_HISTORY_DATES,
        variables: {
          transactionDate,
        },
      })
      .valueChanges.pipe(
        map(
          (
            result: ApolloQueryResult<{
              transactionDates: Array<TransactionHistoryDate>;
            }>
          ) => {
            const dates = result.data.transactionDates.map((t) => {
              const transactionHistoryDate = new TransactionHistoryDate();
              transactionHistoryDate.transactionDate = t.transactionDate;
              transactionHistoryDate.allTransactionsPaid =
                t.allTransactionsPaid;
              return transactionHistoryDate;
            });

            return dates;
          }
        )
      );
  }
}
